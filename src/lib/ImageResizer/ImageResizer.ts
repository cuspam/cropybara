import type { ImageFile } from '$lib/ImageFile';

export interface ImageResizer {
  resize(source: ImageFile, width: number, signal: AbortSignal): Promise<ImageFile>;
}
