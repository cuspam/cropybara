export interface ZipArchiveReaderStatsEvent {
  total: number;
  ready: number;
}

export interface ZipArchiveReaderFileEvent extends ZipArchiveReaderStatsEvent {
  file: File;
}

export interface ZipArchiveReaderErrorEvent extends ZipArchiveReaderStatsEvent {
  filename: string;
  error: string;
}

export type ZipArchiveReaderEvent =
  | ZipArchiveReaderStatsEvent
  | ZipArchiveReaderFileEvent
  | ZipArchiveReaderErrorEvent;
