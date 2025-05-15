import type { Denoiser } from './Denoiser';
import type { ImageFile } from '$lib/ImageFile';
import { InferenceSession, Tensor, type TypedTensor } from 'onnxruntime-web';
import * as ort from 'onnxruntime-web';

export class ONNXDenoiser {
  protected readonly canvas = new OffscreenCanvas(256, 256);
  protected readonly dims = [1, 3, 256, 256];
  protected readonly overlap = 32;

  public async process(file: ImageFile, signal?: AbortSignal) {
    const tensor = await this.convertToTensor(file, signal);
    return this.useModel(async (session) => {
      const imagedata = await this.predict(session, tensor, signal);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      canvas.width = imagedata.width;
      canvas.height = imagedata.height;
      ctx.putImageData(imagedata, 0, 0);

      return canvas.toDataURL('image/png');
    });
  }

  protected async convertToTensor(file: ImageFile, signal?: AbortSignal) {
    signal?.throwIfAborted();
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const image = await file.image();
    signal?.throwIfAborted();
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, 256, 256);
    const imageBufferData = imageData.data; // Uint8ClampedArray [R,G,B,A, R,G,B,A, ...]

    const redArray: number[] = [];
    const greenArray: number[] = [];
    const blueArray: number[] = [];

    // 2. Цикл по буферу изображения для извлечения R, G, B каналов
    for (let i = 0; i < imageBufferData.length; i += 4) {
      redArray.push(imageBufferData[i]);
      greenArray.push(imageBufferData[i + 1]);
      blueArray.push(imageBufferData[i + 2]);
    }

    // 3. Конкатенация RGB для транспонирования [height, width, 3] -> [3, height, width]
    // (в данном случае [targetHeight, targetWidth, 3] -> [3, targetHeight, targetWidth])
    const transposedData = [...redArray, ...greenArray, ...blueArray];

    // 4. Конвертация в float32 и нормализация
    const l = transposedData.length;
    // Размер Float32Array: channels * height * width
    const float32Data = new Float32Array(this.dims[1] * this.dims[2] * this.dims[3]);
    for (let i = 0; i < l; i++) {
      float32Data[i] = transposedData[i] / 255.0; // нормализация к [0, 1]
    }

    // 5. Создание объекта тензора из onnxruntime-web.
    // dims здесь передаются как [batch_size, channels, height, width]
    return new Tensor('float32', float32Data, this.dims);
  }

  protected async predict(
    session: InferenceSession,
    tensor: TypedTensor<'float32'>,
    signal?: AbortSignal,
  ) {
    signal?.throwIfAborted();

    performance.mark('denoiser-predict-start');
    const feeds: Record<string, ort.Tensor> = {};
    feeds[session.inputNames[0]] = tensor;
    // Run the session inference.
    const outputData = await session.run(feeds);
    performance.mark('denoiser-predict-end');
    const denoiserMeasure = performance.measure(
      'denoiser-predict',
      'denoiser-predict-start',
      'denoiser-predict-end',
    );
    console.log('Predict duration:', denoiserMeasure.duration);

    const outputTensorName = session.outputNames[0];
    const resultTensor = outputData[outputTensorName];

    if (!resultTensor) {
      throw new Error(`Output tensor '${outputTensorName}' not found in model results.`);
    }

    if (!(resultTensor instanceof Tensor)) {
      throw new Error('Unexpected output structure from model.run()');
    }

    if (resultTensor.type !== 'float32') {
      throw new Error('Unexpected output type');
    }

    return this.convertTensorToImageData(resultTensor as TypedTensor<'float32'>);
  }

  protected async useModel<T>(fn: (session: InferenceSession) => Promise<T>) {
    const session = await InferenceSession.create(
      '/models/1x_manhwa_null/1x_manhwa_null.with_runtime_opt.ort',
      { executionProviders: ['webnn', 'webgpu', 'webgl', 'wasm'], graphOptimizationLevel: 'all' },
    );
    console.log('Inference session created');

    try {
      return await fn(session);
    } finally {
      session.release();
      console.log('Inference session released');
    }
  }

  protected convertTensorToImageData(tensor: TypedTensor<'float32'>): ImageData {
    // Тип данных тензора должен быть float32, как указано в логе
    const tensorData = tensor.data;
    const dims = tensor.dims; // Ожидаем [1, 3, height, width]

    if (dims.length !== 4 || dims[0] !== 1 || dims[1] !== 3) {
      throw new Error(
        `Unsupported tensor dimensions for image conversion: ${dims}. Expected [1, 3, H, W].`,
      );
    }

    const height = dims[2];
    const width = dims[3];
    const channels = dims[1]; // Должно быть 3

    const numPixels = width * height;
    // Создаем массив для пикселей в формате RGBA
    const pixelArray = new Uint8ClampedArray(width * height * 4);

    for (let i = 0; i < numPixels; i++) {
      // Извлекаем значения каналов R, G, B для текущего пикселя
      // Данные в тензоре хранятся планарно: сначала все R, потом все G, потом все B
      const r_norm = tensorData[i]; // R канал для i-го пикселя
      const g_norm = tensorData[i + numPixels]; // G канал для i-го пикселя
      const b_norm = tensorData[i + 2 * numPixels]; // B канал для i-го пикселя

      // Денормализация: преобразуем из [0,1] (или другого диапазона модели) в [0,255]
      // Умножаем на 255 и обрезаем значения, чтобы они точно попали в диапазон [0, 255]
      pixelArray[i * 4 + 0] = Math.max(0, Math.min(255, Math.round(r_norm * 255.0))); // R
      pixelArray[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(g_norm * 255.0))); // G
      pixelArray[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(b_norm * 255.0))); // B
      pixelArray[i * 4 + 3] = 255; // Alpha (полная непрозрачность)
    }

    return new ImageData(pixelArray, width, height);
  }
}
