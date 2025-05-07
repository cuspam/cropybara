import { ImageFile } from './ImageFile';

export class ImageResizeService {
  private static readonly canvas = new OffscreenCanvas(1, 1);

  public static async resize(
    image: ImageFile,
    width: number
  ): Promise<ImageFile> {
    try {
      const ctx = this.canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      const source = await image.image();

      // Calculate new height maintaining aspect ratio
      const aspectRatio = source.naturalHeight / source.naturalWidth;
      const height = Math.round(width * aspectRatio);

      // Set canvas dimensions
      this.canvas.width = width;
      this.canvas.height = height;

      // Draw the resized image onto the canvas
      ctx.drawImage(source, 0, 0, width, height);

      // Convert canvas to blob
      const blob = await this.canvas.convertToBlob({ type: 'image/png' });

      if (!blob) {
        throw new Error('Failed to convert canvas to blob');
      }

      // Create a new File object
      const resizedFile = new File(
        [blob],
        image.name.split('.').slice(0, -1) + `-w${width}.png`,
        { type: image.type }
      );

      // Create a new ImageFile from the resized file
      return new ImageFile(resizedFile, width, height);
    } finally {
      this.canvas.width = 1;
      this.canvas.height = 1;
    }
  }
}
