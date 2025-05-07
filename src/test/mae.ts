import sharp from 'sharp';

export const losslessThreshold = 0.000001;

export async function mae(
  value: Uint8Array | string,
  golden: Uint8Array | string
) {
  const image1 = sharp(typeof value === 'string' ? value : Buffer.from(value));
  const image2 = sharp(
    typeof golden === 'string' ? golden : Buffer.from(golden)
  );

  const [valueMetadata, goldenMetadata] = await Promise.all([
    image1.metadata(),
    image2.metadata()
  ]);

  if (
    valueMetadata.width !== goldenMetadata.width ||
    valueMetadata.height !== goldenMetadata.height
  ) {
    throw new Error(
      `Image dimensions do not match. Expected: ${goldenMetadata.width}x${goldenMetadata.height}, Actual: ${valueMetadata.width}x${valueMetadata.height}`
    );
  }

  const width = valueMetadata.width!; // Use non-null assertion after checking
  const height = valueMetadata.height!;
  const totalPixels = width * height * 3;

  if (totalPixels === 0) {
    throw new Error('Image has no pixels.');
  }

  // 4. Extract raw pixel data as buffers
  // .raw() decodes the image into an uncompressed buffer (e.g., [R, G, B, R, G, B, ...])
  const [buffer1, buffer2] = await Promise.all([
    image1.flatten().raw().toBuffer(),
    image2.flatten().raw().toBuffer()
  ]);

  // Optional: Verify buffer length (should match totalPixels)
  if (buffer1.length !== totalPixels || buffer2.length !== totalPixels) {
    throw new Error(
      `Internal buffer length mismatch. Calculated: ${totalPixels}, Buffer 1: ${buffer1.length}, Buffer 2: ${buffer2.length}`
    );
  }

  // 5. Calculate the total absolute difference
  let totalDifference = 0;
  // Iterate through the raw byte buffers
  for (let i = 0; i < buffer1.length; i++) {
    totalDifference += Math.abs(buffer1[i] - buffer2[i]);
  }

  // 6. Calculate the Mean Absolute Error
  // Normalize by dividing by the total number of pixel values compared (width * height * channels)
  return totalDifference / totalPixels;
}
