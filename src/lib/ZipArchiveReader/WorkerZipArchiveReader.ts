import type { ZipArchiveReader } from '$lib/ZipArchiveReader/ZipArchiveReader';
import type {
  ZipArchiveReaderErrorEvent,
  ZipArchiveReaderEvent,
} from '$lib/ZipArchiveReader/ZipArchiveReaderEvent';
import type { IncomingMessage } from '$lib/Workers/ZipArchiveReaderWorker';
import { WebWorkerMessageListener } from '$lib/WebWorkerMessageListener';

export class WorkerZipArchiveReader implements ZipArchiveReader {
  public async *read(archiveFile: File): AsyncGenerator<ZipArchiveReaderEvent> {
    const worker = new Worker(new URL('../Workers/ZipArchiveReaderWorker.ts', import.meta.url), {
      type: 'module',
    });

    // Send the file to the worker
    worker.postMessage({ archiveFile } satisfies IncomingMessage);

    const workerListener = new WebWorkerMessageListener<ZipArchiveReaderEvent>(worker);

    try {
      // Listen for messages from the worker and yield them
      for await (const event of workerListener.listen()) {
        yield event;

        // Check if this is a final event (all files processed or a worker-reported error)
        // The worker is designed to send an event where ready === total upon successful completion.
        // It also sends ZipArchiveReaderErrorEvent for file processing errors.
        if (
          event.ready === event.total ||
          ('error' in event && event.filename) // A specific file error event
        ) {
          // If it's a specific file error, the worker continues, so we don't break.
          // We only break if it's the *final* message indicating completion.
          if (event.ready === event.total) {
            break;
          }
        }
      }
    } catch (error) {
      // This catch block handles errors from the workerListener.listen() generator itself,
      // which typically means a more fundamental issue with the worker (e.g., it crashed).
      console.error('Error iterating over messages from ZipArchiveReaderWorker:', error);
      // Yield a generic error message to the consumer
      yield {
        total: 0,
        ready: 0,
        error: `Worker communication error: ${error instanceof Error ? error.message : String(error)}`,
      } as ZipArchiveReaderErrorEvent;
    } finally {
      // Always terminate the worker when done or if an error occurs.
      worker.terminate();
    }
  }
}
