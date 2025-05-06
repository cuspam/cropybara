/**
 * A generic class to listen for messages and errors from a Web Worker
 * and yield them as an asynchronous stream of messages.
 */
export class WebWorkerMessageListener<TMessage> {
  private worker: Worker;

  constructor(worker: Worker) {
    this.worker = worker;
  }

  /**
   * Listens to messages from the worker.
   * The generator continues to yield messages until the worker terminates,
   * an unrecoverable error occurs in the worker, or the consumer stops iterating.
   *
   * It's the responsibility of the code using this listener to terminate the worker
   * when it's no longer needed.
   */
  public async *listen(): AsyncGenerator<TMessage, void, unknown> {
    let messageListener: ((event: MessageEvent) => void) | null = null;
    let errorListener: ((event: ErrorEvent) => void) | null = null;

    // Store current promise resolvers to allow cleanup if generator is terminated externally
    let currentResolve: ((value: TMessage | PromiseLike<TMessage>) => void) | null = null;
    let currentReject: ((reason?: unknown) => void) | null = null;

    messageListener = (event: MessageEvent) => {
      if (currentResolve) {
        currentResolve(event.data as TMessage);
      }
    };

    errorListener = (errorEvent: ErrorEvent) => {
      // This listener catches errors like script errors in the worker itself,
      // or unhandled exceptions that cause the worker to terminate.
      console.error(
        'Error from worker global scope:',
        errorEvent.message,
        errorEvent.filename,
        errorEvent.lineno,
      );
      if (currentReject) {
        currentReject(new Error(`Worker error: ${errorEvent.message || 'Unknown worker error'}`));
      }
    };

    this.worker.addEventListener('message', messageListener);
    this.worker.addEventListener('error', errorListener);

    try {
      while (true) {
        // Wait for the next message or an error
        const eventData = await new Promise<TMessage>((resolve, reject) => {
          currentResolve = resolve;
          currentReject = reject;
        });
        yield eventData; // Yield the received message data

        // Reset resolvers for the next iteration's promise
        currentResolve = null;
        currentReject = null;
      }
    } catch {
      // This catch block will be hit if the promise created within the loop is rejected
      // (e.g., by the worker's 'error' event) or if any other error occurs during promise handling.
      // The generator will then terminate. The consumer (for...await...of loop) can also catch this error.
      // console.debug('WebWorkerMessageListener: Error during listen, generator terminating.', error);
      // No need to re-throw; the generator simply ends.
      return;
    } finally {
      // This block executes when the generator is exited, either normally (e.g. loop break in consumer),
      // by an error, or if the consumer stops iterating (e.g. 'return' or 'break' in for...await...of).
      if (messageListener) {
        this.worker.removeEventListener('message', messageListener);
      }
      if (errorListener) {
        this.worker.removeEventListener('error', errorListener);
      }
      // If there was a pending promise when the generator exited, reject it.
      if (currentReject) {
        (currentReject as (reason?: unknown) => void)(
          new Error('WebWorkerMessageListener: Generator terminated while awaiting message.'),
        );
      }
    }
  }
}
