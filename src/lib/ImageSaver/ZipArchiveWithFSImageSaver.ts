import type { ImagesSaver } from './ImagesSaver';
import { browser } from '$app/environment';

export class ZipArchiveWithFSImageSaver implements ImagesSaver {
  public static readonly isSupported = browser && 'showSaveFilePicker' in window;

  public async save(
    name: string,
    images: AsyncGenerator<File>,
    onprogress?: () => void,
  ): Promise<void> {
    const jszipPromise = import('jszip');
    // @ts-expect-error https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker
    const handle: FileSystemFileHandle = await showSaveFilePicker({
      id: 'cropybara-results-zip',
      startIn: 'downloads',
      suggestedName: name + '.zip',
      types: [
        {
          description: 'Zip archive',
          accept: { 'application/zip': ['.zip'] },
        },
      ],
    });

    const fileStream = await handle.createWritable();
    const { default: JSZip } = await jszipPromise;

    const zip = new JSZip();

    for await (const file of images) {
      zip.file(file.name, file.bytes());
      onprogress?.();
    }

    const stream = zip.generateInternalStream({
      type: 'arraybuffer',
      streamFiles: true,
      compression: 'STORE',
    });

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk) => {
        fileStream.write(chunk);
      });
      stream.on('end', () => {
        fileStream.close();
        resolve();
      });
      stream.on('error', reject);
      stream.resume();
    });
    onprogress?.();
  }
}
