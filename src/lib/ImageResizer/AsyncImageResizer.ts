import { ImageFile } from '$lib/ImageFile';
import { Queue } from '$lib/Queue';
import type { ImageResizer } from './ImageResizer';

export class AsyncImageResizer implements ImageResizer {
  private readonly queue = new Queue([new OffscreenCanvas(1, 1)]);

  public async resize(image: ImageFile, width: number, signal: AbortSignal): Promise<ImageFile> {
    return this.queue.enqueue(async (canvas) => {
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        const source = await image.image();
        const type = 'image/png';

        // Calculate new height maintaining aspect ratio
        const aspectRatio = source.naturalHeight / source.naturalWidth;
        const height = Math.round(width * aspectRatio);

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw the resized image onto the canvas
        ctx.drawImage(source, 0, 0, width, height);

        // Convert canvas to blob
        const blob = await canvas.convertToBlob({ type });

        // Create a new File object
        const resizedFile = new File(
          [blob],
          image.name.split('.').slice(0, -1) + `-w${width}.png`,
          {
            type,
            lastModified: image.lastModified,
          },
        );

        // Create a new ImageFile from the resized file
        return new ImageFile(resizedFile, width, height);
      } finally {
        canvas.width = 1;
        canvas.height = 1;
      }
    }, signal);
  }
}
