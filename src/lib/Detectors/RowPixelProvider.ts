import type { ImageFile } from '$lib/ImageFile';

// Helper class to efficiently get grayscale pixel rows from a list of ImageFiles
export class RowPixelProvider {
  public readonly totalHeight: number;
  private imageStartRows: number[]; // Global Y-coordinate of the start of each image

  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private stripGlobalOffsetY: number = -1; // Global Y-coordinate of the top of the current "strip"
  private canvasHeight: number = 0; // Height of the current "strip" on the canvas
  private isStripLoaded: boolean = false;

  public constructor(private images: ImageFile[]) {
    this.imageStartRows = [];
    let currentHeight = 0;
    for (let i = 0; i < this.images.length; i++) {
      this.imageStartRows.push(currentHeight);
      currentHeight += this.images[i].height;
    }
    this.totalHeight = currentHeight;

    // "Strip" height: not too small, not excessively large.
    // "canvas height not greater than its width" -> this.combinedWidth
    // Also, limit to a maximum value for performance.
    this.canvasHeight = Math.min(this.totalHeight, images[0].width, 4096);

    if (typeof OffscreenCanvas !== 'undefined') {
      this.canvas = new OffscreenCanvas(images[0].width, this.canvasHeight);
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.width = images[0].width;
      this.canvas.height = this.canvasHeight;
    }

    // SvelteKit's linter is found ctx as ImageBitmapRenderingContext for some reason.
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true }) as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;

    if (!ctx) throw new Error('Failed to get 2D context for strip canvas');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false; // For precise pixel data
  }

  public async getGrayscaleRow(globalRowY: number): Promise<number[]> {
    if (this.totalHeight === 0) return [];
    if (globalRowY < 0 || globalRowY >= this.totalHeight) {
      throw new Error(
        `Out of global bounds: globalRowY ${globalRowY} not in [0, ${this.totalHeight - 1}]`,
      );
    }

    // Check if the row is in the cached "strip"
    if (
      !this.isStripLoaded ||
      globalRowY < this.stripGlobalOffsetY ||
      globalRowY >= this.stripGlobalOffsetY + this.canvasHeight
    ) {
      await this.loadStripContaining(globalRowY);
    }

    const localStripY = globalRowY - this.stripGlobalOffsetY;
    if (localStripY < 0 || localStripY >= this.canvasHeight) {
      throw new Error(
        `Out of strip bounds: localStripY ${localStripY} not in [0, ${this.canvasHeight - 1}]`,
      );
    }

    const imageData = this.ctx.getImageData(0, localStripY, this.images[0].width, 1);
    const grayscaleRow: number[] = new Array(this.images[0].width);
    for (let i = 0; i < this.images[0].width; ++i) {
      const r_idx = i * 4;
      const r = imageData.data[r_idx];
      const g = imageData.data[r_idx + 1];
      const b = imageData.data[r_idx + 2];

      grayscaleRow[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }

    return grayscaleRow;
  }

  private async loadStripContaining(globalRowYTarget: number): Promise<void> {
    if (this.totalHeight === 0 || this.canvasHeight === 0) {
      this.isStripLoaded = false;
      return;
    }

    // Calculate stripGlobalOffsetY so that globalRowYTarget is the last row on the canvas.
    // The top row of the canvas will be globalRowYTarget - (canvasHeight - 1)
    this.stripGlobalOffsetY = globalRowYTarget - this.canvasHeight + 1;

    // Limit stripGlobalOffsetY so it's not less than 0.
    this.stripGlobalOffsetY = Math.max(0, this.stripGlobalOffsetY);

    // Limit stripGlobalOffsetY so the strip doesn't go beyond the total content at the bottom.
    // Maximum possible stripGlobalOffsetY = totalHeight - canvasHeight.
    // If totalHeight < canvasHeight, then stripGlobalOffsetY should be 0.
    const maxPossibleStripOffsetY = Math.max(0, this.totalHeight - this.canvasHeight);
    this.stripGlobalOffsetY = Math.min(this.stripGlobalOffsetY, maxPossibleStripOffsetY);

    this.ctx.clearRect(0, 0, this.images[0].width, this.canvasHeight);

    for (let i = 0; i < this.images.length; i++) {
      const imgFile = this.images[i];
      const imgGlobalStartY = this.imageStartRows[i];
      const imgGlobalEndY = imgGlobalStartY + imgFile.height;

      // Check for intersection of the image and the "strip"
      if (
        imgGlobalEndY > this.stripGlobalOffsetY &&
        imgGlobalStartY < this.stripGlobalOffsetY + this.canvasHeight
      ) {
        const htmlImg = await imgFile.image(); // Load HTMLImageElement

        // Source region from the original image
        const sX = 0;
        const sWidth = imgFile.width;

        // Calculate sY and sHeight to correctly cut the part of the image that falls into the "strip"
        let sY_offset_from_img_top = Math.max(0, this.stripGlobalOffsetY - imgGlobalStartY);
        let sY = sY_offset_from_img_top;

        let sHeight = imgFile.height - sY_offset_from_img_top;
        if (
          imgGlobalStartY + sY_offset_from_img_top + sHeight >
          this.stripGlobalOffsetY + this.canvasHeight
        ) {
          sHeight =
            this.stripGlobalOffsetY +
            this.canvasHeight -
            (imgGlobalStartY + sY_offset_from_img_top);
        }

        // Destination region on the "strip" canvas
        const dX = 0;
        let dY = Math.max(0, imgGlobalStartY - this.stripGlobalOffsetY);
        const dWidth = imgFile.width; // Draw the image with its original width
        const dHeight = sHeight;

        if (sWidth > 0 && sHeight > 0 && dWidth > 0 && dHeight > 0) {
          // Additional checks to ensure sY and sHeight are within imgFile.height
          sY = Math.max(0, Math.min(sY, imgFile.height));
          sHeight = Math.max(0, Math.min(sHeight, imgFile.height - sY));

          if (sHeight > 0) {
            this.ctx.drawImage(htmlImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
          }
        }
      }
    }

    this.isStripLoaded = true;
  }
}
