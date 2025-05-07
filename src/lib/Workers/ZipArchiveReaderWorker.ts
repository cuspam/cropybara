/// <reference lib="webworker" />
import { AsyncZipArchiveReader } from '$lib/ZipArchiveReader/AsyncZipArchiveReader';
import type { ZipArchiveReaderErrorEvent } from '$lib/ZipArchiveReader/ZipArchiveReaderEvent';

const reader = new AsyncZipArchiveReader();
// Listen for messages from the main thread
self.onmessage = async (event: MessageEvent<IncomingMessage>) => {
  const { archiveFile } = event.data;
  if (archiveFile instanceof File) {
    try {
      for await (const event of reader.read(archiveFile)) {
        postMessage(event);
      }
    } catch (error) {
      console.error('Error processing archive in worker:', error);
      postMessage({
        error: `Failed to process archive: ${error instanceof Error ? error.message : String(error)}`,
        filename: archiveFile.name,
        total: 0, // Indicate total is unknown
        ready: 0,
      } satisfies ZipArchiveReaderErrorEvent);
    }
  } else {
    console.error('Worker received invalid data:', event.data);
  }
};

// Define the types for messages sent to the worker
export interface IncomingMessage {
  archiveFile: File;
}

export {};
