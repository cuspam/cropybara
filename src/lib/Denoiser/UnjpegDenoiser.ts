import type { Client } from '@gradio/client';
import { ImageFile } from '../ImageFile';
import pLimit from 'p-limit';
import type { Denoiser } from './Denoiser';

export class UnjpegDenoiser implements Denoiser {
  private readonly client: Promise<Client>;
  private readonly queue = pLimit(4);

  public constructor(endpoint: string) {
    this.client = import('@gradio/client').then(({ Client }) => Client.connect(endpoint));
  }

  public async process(image: ImageFile, signal?: AbortSignal) {
    const tileSize = 1024;
    const tileOverlap = this.tileOverlap(Math.min(image.width, image.height), 128);

    const result = await this.enqueue((client) => {
      signal?.throwIfAborted();
      return client.predict('/predict', {
        input_pil_image: image,
        tile_size: tileSize,
        tile_overlap: tileOverlap,
      });
    });

    const data = result.data as { url?: string }[];
    const url = data[0].url;

    if (!url) {
      throw new Error('No result url');
    }

    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch result: ${response.statusText}`);
    }

    const blob = await response.blob();
    return ImageFile.fromFile(new File([blob], image.name, { type: 'image/png' }));
  }

  protected enqueue<T>(task: (client: Client) => Promise<T>): Promise<T> {
    return this.queue(async () => {
      const client = await this.client;
      return await task(client);
    });
  }

  protected tileOverlap(side: number, max: number) {
    if (side < 16) return 0;
    return Math.min(max, Math.pow(2, Math.floor(Math.log2(side))));
  }
}
