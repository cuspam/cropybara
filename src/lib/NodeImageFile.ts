import { ImageFile } from './ImageFile';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export class NodeImageFile extends ImageFile {
  public static async fromFS(filepath: string): Promise<ImageFile> {
    const imageBuffer = await fs.readFile(filepath);
    const filename = path.parse(filepath).name;
    const file = new File([imageBuffer], filename, { type: `image/png` });
    const metadata = await sharp(imageBuffer).metadata();

    return new NodeImageFile(file, metadata.width!, metadata.height!, filepath.split('/').pop()!);
  }

  public async image(): Promise<HTMLImageElement> {
    const img = new Image();
    // @ts-expect-error https://www.npmjs.com/package/canvas/v/2.0.0-alpha.7#imagesrcbuffer
    img.src = Buffer.from(await this.arrayBuffer());
    return img;
  }

  public async bytes(): Promise<Uint8Array> {
    return Buffer.from(await this.arrayBuffer());
  }
}
