import { ImageFile } from '$lib/ImageFile';

export interface Denoiser {
  process(image: ImageFile, signal?: AbortSignal): Promise<ImageFile>;
}
