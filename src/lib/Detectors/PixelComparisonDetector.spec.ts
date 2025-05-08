import { describe, it, expect, vi } from 'vitest';
import { NodeImageFile } from '$lib/NodeImageFile';
import { PixelComparisonDetector } from './PixelComparisonDetector';
import path from 'node:path';

describe('PixelComparisonDetector', () => {
  it('should find multiple cuts at regular intervals on plain image', async () => {
    const image = await NodeImageFile.fromFS(fixture('50x1600.jpg'));
    const cuts = await PixelComparisonDetector.process([image], {
      step: 5,
      margins: 5,
      maxDistance: 300,
      maxSearchDeviationFactor: 0.5,
      sensitivity: 0.9,
    });

    expect(cuts).toStrictEqual([300, 600, 900, 1200, 1500]);
  });

  it('should make content-aware cuts avoiding distinct image features', async () => {
    const image = await NodeImageFile.fromFS(fixture('100x300.png'));
    const cuts = await PixelComparisonDetector.process([image], {
      step: 5,
      margins: 5,
      maxDistance: 100,
      maxSearchDeviationFactor: 0.5,
      sensitivity: 0.9,
    });

    expect(cuts).toStrictEqual([100, 190, 255]);
  });
});

function fixture(name: string) {
  return path.join(__dirname, '__fixtures__', name);
}
