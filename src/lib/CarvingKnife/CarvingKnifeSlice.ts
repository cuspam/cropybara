import type { CarvingKnifeSliceChunk } from './CarvingKnifeSliceChunk';
import type { CarvingKnifeSource } from './CarvingKnifeSource';

export interface CarvingKnifeSlice<T extends CarvingKnifeSource> {
  width: number;
  height: number;
  chunks: Array<CarvingKnifeSliceChunk<T>>;
}
