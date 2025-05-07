import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CanvasChef } from '$lib/Chef/CanvasChef';
import fs from 'node:fs/promises';
import * as path from 'node:path';
import { CarvingKnife } from '$lib/CarvingKnife/CarvingKnife';
import type { Chef } from '$lib/Chef/Chef';
import { NodeImageFile } from '$lib/NodeImageFile';
import type { ImageFile } from '$lib/ImageFile';
import { mae } from '../../test/mae';
import type { CarvingKnifeSlice } from '$lib/CarvingKnife/CarvingKnifeSlice';

vi.mock('$lib/ImageFile', async () => {
  // Dynamically import the actual NodeImageFile implementation
  const { NodeImageFile } =
    await vi.importActual<typeof import('../NodeImageFile')>('../NodeImageFile');

  // Return an object where the 'ImageFile' export points to 'NodeImageFile'
  return { ImageFile: NodeImageFile };
});

describe('CanvasChef', async () => {
  const image = await NodeImageFile.fromFS(fixture('50x1600.jpg'));

  const implementations: Record<string, Chef> = {};

  beforeEach(async () => {
    implementations['CanvasChef'] = new CanvasChef();
  });

  it('should process a single image with one cut point', async () => {
    const recipe = CarvingKnife.cut([image], [800]);
    await compare(implementations, recipe);
  });

  it('should process a single image with multiple cut points', async () => {
    const recipe = CarvingKnife.cut([image], [320, 640]);
    await compare(implementations, recipe);
  });

  it('should process multiple images with a single cut point between them', async () => {
    const recipe = CarvingKnife.cut([image, image], [1600]);
    await compare(implementations, recipe);
  });

  it('should process multiple images with multiple cut points', async () => {
    const recipe = CarvingKnife.cut([image, image], [1280, 2560]);
    await compare(implementations, recipe);
  });
});

function fixture(name: string) {
  return path.join(__dirname, '__fixtures__', name);
}

async function compare(
  implementations: Record<string, Chef>,
  recipe: CarvingKnifeSlice<ImageFile>[],
  save: boolean = false,
  losslessThreshold = 0.00001,
) {
  const controller = new AbortController();

  const results = Object.fromEntries(
    await Promise.all(
      Object.entries(implementations).map(async ([name, chef]) => {
        const slices: Map<number, ImageFile> = new Map();
        for await (const slice of chef.process(recipe, controller.signal)) {
          slices.set(parseInt(slice.name, 10), slice);

          if (save) {
            await fs.writeFile(`./storage/${name}-${slice.name}`, await slice.bytes());
          }
        }

        return [name, slices] as const;
      }),
    ).catch((err) => {
      controller.abort(err);
      throw err;
    }),
  );

  const refImplementation = Object.keys(implementations)[0];
  const slicesNumber = results[refImplementation].size;
  for (const name of Object.keys(implementations)) {
    // Check that all implementations returned the same number of images
    expect(results[name].size).toBe(slicesNumber);
  }

  for (let i = 1; i <= slicesNumber; i++) {
    const refImplementationSlice = results[refImplementation].get(i)!;
    const refImplementationSliceBytes = await refImplementationSlice.bytes();

    for (const name of Object.keys(implementations)) {
      const slice = results[name].get(i)!;
      const bytes = await slice.bytes();

      // Check slice height
      expect(
        slice.height,
        `Slice ${slice.name} has different height between ${name} and ${refImplementation}`,
      ).toBe(refImplementationSlice.height);

      // Check slice width
      expect(
        slice.width,
        `Slice ${slice.name} has different width between ${name} and ${refImplementation}`,
      ).toBe(refImplementationSlice.width);

      // Check slice content
      await expect(
        mae(bytes, refImplementationSliceBytes),
        `Slice ${slice.name} has too big mae score between ${name} and ${refImplementation}`,
      ).resolves.lessThan(losslessThreshold);
    }
  }
}
