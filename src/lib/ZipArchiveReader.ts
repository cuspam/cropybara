import { FileTypes } from '$lib/FileTypes';
import type {
  ZipArchiveReaderErrorEvent,
  ZipArchiveReaderEvent,
  ZipArchiveReaderFileEvent,
} from '$lib/ZipArchiveReaderEvent';

export class ZipArchiveReader {
  public static async *read(
    archiveFile: File,
  ): AsyncGenerator<
    ZipArchiveReaderEvent | ZipArchiveReaderFileEvent | ZipArchiveReaderErrorEvent
  > {
    const { default: jszip } = await import('jszip');
    const archive = await jszip.loadAsync(archiveFile);

    const files = Object.keys(archive.files).sort((l, r) =>
      l.localeCompare(r, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );

    yield { total: files.length, ready: 0 };

    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const zipObject = archive.files[filename];
      if (!zipObject || zipObject.dir) {
        yield { total: files.length, ready: i + 1 };
        continue;
      }

      try {
        const type = FileTypes.getMimeByFilename(filename);
        const blob = await zipObject.async('uint8array');

        yield {
          total: files.length,
          ready: i + 1,
          file: new File([blob], filename, { type, lastModified: zipObject.date.getTime() }),
        };
      } catch (error) {
        yield {
          total: files.length,
          ready: i + 1,
          filename,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }
}
