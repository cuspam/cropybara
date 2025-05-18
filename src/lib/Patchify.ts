import { ImageFile } from '$lib/ImageFile';

export class Patchify {
  protected readonly canvas: OffscreenCanvas;
  public readonly recipe: PatchRecipe[];
  private readonly patchSize: number; // Store this.size for clarity, same as this.size

  public constructor(
    public readonly image: ImageFile,
    public readonly size: number, // Size of each square patch
    minOverlap: number,
  ) {
    // this.canvas is initially used for extracting patches.
    // It will be resized later in process() to hold the final stitched image.
    this.canvas = new OffscreenCanvas(size, size);
    this.patchSize = size; // Store for stitch method clarity
    this.recipe = this.generatePatchCoordinates(minOverlap);
  }

  public async process(fn: (patch: ImageData) => Promise<ImageData>): Promise<ImageFile> {
    // Context for the small canvas used for patch extraction
    const extractCtx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!extractCtx) {
      throw new Error('Failed to get canvas context for patch extraction');
    }

    const image = await this.image.image();

    const processedPatches: ImageData[] = [];
    for (const patchRecipe of this.recipe) {
      // Ensure the extraction canvas is the correct size for drawing this patch section.
      // This canvas is `this.patchSize x this.patchSize`.
      if (this.canvas.width !== this.patchSize || this.canvas.height !== this.patchSize) {
        this.canvas.width = this.patchSize;
        this.canvas.height = this.patchSize;
      }
      // Clear the small canvas before drawing the new patch part to handle transparency correctly.
      extractCtx.clearRect(0, 0, this.patchSize, this.patchSize);
      extractCtx.drawImage(
        image,
        patchRecipe.x,
        patchRecipe.y,
        this.patchSize, // Source width
        this.patchSize, // Source height
        0, // Destination x on small canvas
        0, // Destination y on small canvas
        this.patchSize, // Destination width on small canvas
        this.patchSize, // Destination height on small canvas
      );
      const patch = extractCtx.getImageData(0, 0, this.patchSize, this.patchSize);
      processedPatches.push(await fn(patch));
    }

    // Stitch the processed patches back together onto this.canvas
    const blob = await this.stitchPatches(processedPatches);
    const file = new File([blob], this.image.name, { type: 'image/png', lastModified: Date.now() });
    return new ImageFile(file, image.width, image.height);
  }

  protected async stitchPatches(processedPatches: ImageData[]): Promise<Blob> {
    const fullWidth = this.image.width;
    const fullHeight = this.image.height;

    // Resize this.canvas to fit the full stitched image
    // The same canvas object is reused.
    this.canvas.width = fullWidth;
    this.canvas.height = fullHeight;

    // Get context for the now-resized canvas, which will be the final output canvas
    const finalCtx = this.canvas.getContext('2d');
    if (!finalCtx) {
      throw new Error('Failed to get final canvas context after resize');
    }

    const stitchedImageData = finalCtx.createImageData(fullWidth, fullHeight);
    const stitchedData = stitchedImageData.data;

    // Helper function for 1D weight calculation (tent filter)
    // Weight is 1.0 at the center of the dimension, 0.0 at the edges.
    const get1DWeight = (localPosition: number, dimensionSize: number): number => {
      if (dimensionSize <= 0) return 0.0; // Guard against invalid size
      if (dimensionSize === 1) return 1.0; // Single pixel - full weight

      // Center of the discrete index range [0, ..., dimensionSize-1]
      const center = (dimensionSize - 1) / 2.0;
      const distanceToCenter = Math.abs(localPosition - center);

      // Effective "half-width" for weight normalization.
      // Using `dimensionSize / 2.0` (instead of `(dimensionSize - 1) / 2.0`) ensures non-zero weight at edges.
      // Max `distanceToCenter` (at edges) is `(dimensionSize - 1) / 2.0`.
      // `effectiveHalfWidth` (`dimensionSize / 2.0`) is thus slightly larger than max `distanceToCenter`
      // for pixels within [0, dimensionSize-1] (if dimensionSize > 1).
      // This ensures `distanceToCenter / effectiveHalfWidth < 1`, so `weight > 0` within the patch.
      const effectiveHalfWidth = dimensionSize / 2.0;

      // Weight becomes 0 only if `distanceToCenter == effectiveHalfWidth`, which would
      // require `localPosition` to be outside the [0, dimensionSize-1] range.
      const weight = 1.0 - distanceToCenter / effectiveHalfWidth;

      return Math.max(0.0, weight); // Clamp to avoid negative weights due to floating point inaccuracies
    };

    for (let y = 0; y < fullHeight; y++) {
      for (let x = 0; x < fullWidth; x++) {
        let totalWeight = 0;
        let sumR = 0,
          sumG = 0,
          sumB = 0,
          sumA = 0;

        for (let i = 0; i < processedPatches.length; i++) {
          const patchImageData = processedPatches[i];
          const patchRecipe = this.recipe[i]; // Original top-left (x,y) of this patch

          // Check if the global pixel (x,y) is within the bounds of this patch
          if (
            x >= patchRecipe.x &&
            x < patchRecipe.x + this.patchSize &&
            y >= patchRecipe.y &&
            y < patchRecipe.y + this.patchSize
          ) {
            // Calculate local coordinates within the current patch
            const localX = x - patchRecipe.x;
            const localY = y - patchRecipe.y;

            const weightX = get1DWeight(localX, this.patchSize);
            const weightY = get1DWeight(localY, this.patchSize);
            const weight = weightX * weightY; // 2D weight is product of 1D weights

            if (weight <= 0) continue; // No contribution from this patch for this pixel (or negligible)

            const patchPixelDataIndex = (localY * this.patchSize + localX) * 4;
            sumR += patchImageData.data[patchPixelDataIndex] * weight;
            sumG += patchImageData.data[patchPixelDataIndex + 1] * weight;
            sumB += patchImageData.data[patchPixelDataIndex + 2] * weight;
            sumA += patchImageData.data[patchPixelDataIndex + 3] * weight;
            totalWeight += weight;
          }
        }

        const stitchedPixelDataIndex = (y * fullWidth + x) * 4;
        if (totalWeight > 0) {
          stitchedData[stitchedPixelDataIndex] = sumR / totalWeight;
          stitchedData[stitchedPixelDataIndex + 1] = sumG / totalWeight;
          stitchedData[stitchedPixelDataIndex + 2] = sumB / totalWeight;
          stitchedData[stitchedPixelDataIndex + 3] = sumA / totalWeight;
        } else {
          // This case should ideally not be reached if patches cover the entire image.
          // Fill with transparent black as a fallback.
          stitchedData[stitchedPixelDataIndex] = 0;
          stitchedData[stitchedPixelDataIndex + 1] = 0;
          stitchedData[stitchedPixelDataIndex + 2] = 0;
          stitchedData[stitchedPixelDataIndex + 3] = 0;
        }
      }
    }
    // Draw the final stitched image data onto the (now full-sized) canvas
    finalCtx.putImageData(stitchedImageData, 0, 0);
    return this.canvas.convertToBlob({ type: 'image/png' });
  }

  protected calculateChunks(axis: number, size: number, minOverlap: number): number {
    if (axis <= 0) {
      throw new Error('Image dimension must be positive.');
    }
    // If the whole axis fits into one chunk or less.
    if (axis <= size) {
      return 1;
    }
    // Overlap must be less than patch size for progression.
    if (minOverlap >= size) {
      throw new Error(`minOverlap (${minOverlap}) must be less than patch size (${size}).`);
    }

    const advance = size - minOverlap;
    // If advance is not positive, it means minOverlap is too large or size is too small.
    // This should be caught by `minOverlap >= size` but is a safeguard.
    if (advance <= 0) {
      throw new Error(
        `Calculated advance step (${advance}) is not positive. Check patch size and minOverlap.`,
      );
    }
    // The number of chunks is 1 (for the first patch) + the number of additional 'advance' steps needed.
    // We need to cover the remaining length (axis - size) with steps of 'advance'.
    return 1 + Math.ceil((axis - size) / advance);
  }

  protected generatePatchCoordinates(minOverlap: number): PatchRecipe[] {
    // Use this.patchSize consistently as it's synonymous with this.size
    const yChunks = this.calculateChunks(this.image.height, this.patchSize, minOverlap);
    const xChunks = this.calculateChunks(this.image.width, this.patchSize, minOverlap);

    const patches: PatchRecipe[] = [];
    const imageWidth = this.image.width;
    const imageHeight = this.image.height;

    const advance = this.patchSize - minOverlap;

    for (let j = 0; j < yChunks; j++) {
      let currentY: number;
      if (yChunks === 1) {
        currentY = 0;
      } else if (j === yChunks - 1) {
        // Last chunk in y-direction
        currentY = imageHeight - this.patchSize;
      } else {
        // First or intermediate chunk
        currentY = j * advance;
      }
      currentY = Math.max(0, currentY); // Ensure not negative if imageHeight < patchSize

      for (let i = 0; i < xChunks; i++) {
        let currentX: number;
        if (xChunks === 1) {
          currentX = 0;
        } else if (i === xChunks - 1) {
          // Last chunk in x-direction
          currentX = imageWidth - this.patchSize;
        } else {
          // First or intermediate chunk
          currentX = i * advance;
        }
        currentX = Math.max(0, currentX); // Ensure not negative if imageWidth < patchSize

        patches.push({
          x: currentX,
          y: currentY,
        });
      }
    }
    return patches;
  }
}

interface PatchRecipe {
  x: number; // Top-left X coordinate of the patch in the original image
  y: number; // Top-left Y coordinate of the patch in the original image
}
