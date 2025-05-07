import type { CarvingKnifeSource } from './CarvingKnifeSource';

export interface CarvingKnifeSliceChunk<T extends CarvingKnifeSource> {
  src: T;
  srcX: number;
  srcY: number;
  srcWidth: number;
  srcHeight: number;
  dstX: number;
  dstY: number;
  dstWidth: number;
  dstHeight: number;
}
