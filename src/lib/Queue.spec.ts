import { describe, expect, it } from 'vitest';
import { WorkerQueue } from './Queue';

describe('Queue', () => {
  it('should process tasks in parallel across all workers', async () => {
    const delay = () => (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    const queue = new WorkerQueue([delay(), delay()]);

    const tasks = Array.from(
      { length: 4 },
      () => async (resourse: ReturnType<typeof delay>) => {
        await resourse(100);
        return Date.now().toString();
      }
    );

    const controller = new AbortController();
    const signal = controller.signal;
    const start = Date.now();
    await Promise.all(tasks.map((t) => queue.enqueue(t, signal)));
    expect(Date.now() - start)
      .lessThan(300)
      .greaterThan(199);
  });
});
