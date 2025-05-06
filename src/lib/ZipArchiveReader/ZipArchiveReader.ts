import type {
  ZipArchiveReaderErrorEvent,
  ZipArchiveReaderEvent,
  ZipArchiveReaderFileEvent,
} from '$lib/ZipArchiveReader/ZipArchiveReaderEvent';

export interface ZipArchiveReader {
  read(
    file: File,
  ): AsyncGenerator<ZipArchiveReaderEvent | ZipArchiveReaderFileEvent | ZipArchiveReaderErrorEvent>;
}
