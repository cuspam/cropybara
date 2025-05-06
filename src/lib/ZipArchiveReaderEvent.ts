export interface ZipArchiveReaderEvent {
  total: number;
  ready: number;
}

export interface ZipArchiveReaderFileEvent extends ZipArchiveReaderEvent {
  file: File;
}

export interface ZipArchiveReaderErrorEvent extends ZipArchiveReaderEvent {
  filename: string;
  error: string;
}
