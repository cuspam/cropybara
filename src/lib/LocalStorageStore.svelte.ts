import { browser } from '$app/environment';

/**
 * A reactive Svelte store that automatically persists its value
 * in the browser's localStorage.
 *
 * It initializes its state from localStorage if a value exists for the given key,
 * otherwise, it uses the provided initial value. Changes to the store's value
 * are automatically saved back to localStorage.
 *
 * @template T The type of the value stored.
 */
export class LocalStorageStore<T> {
  public value: T = $state() as T;
  public readonly key: string;

  public constructor(key: string, init: T) {
    this.key = `sveltekit:store:${key}`;

    if (browser) {
      try {
        const item = localStorage.getItem(this.key);
        if (item) {
          init = this.deserialize(item);
        }
      } catch (err: unknown) {
        console.error(`Error restoring localStorage value for "${key}":`, err);
      }
    }

    this.value = init;

    $effect(() => {
      try {
        localStorage.setItem(this.key, this.serialize(this.value));
      } catch (err: unknown) {
        console.error(`Error setting localStorage value for "${key}":`, err);
      }
    });
  }

  protected serialize(value: T): string {
    return JSON.stringify(value);
  }

  protected deserialize(item: string): T {
    return JSON.parse(item);
  }
}
