<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
  import type { LocalFilesPickerProps } from '$lib/LocalFilesPickerProps';
  import { ProgressBarState, type ProgressBarStateItem } from '$lib/States/ProgressBarState.svelte';

  const { onFiles }: LocalFilesPickerProps = $props();
  const progressBar = ProgressBarState.use();
  let displayDropZone = $state(false);
  let dragCounter = $state(0);

  function handleDragEnter(event: DragEvent) {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    displayDropZone = true;
    dragCounter++;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      displayDropZone = false;
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    handleDragLeave(event);
    if (progressBar.display) return;

    const items = Array.from(event.dataTransfer?.items ?? []);
    if (items.length === 0) {
      onFiles([]);
      return;
    }

    const state = $state({ total: items.length, ready: 0 });
    const task = () => state;
    progressBar.add(task);

    try {
      const result = await Promise.all(
        items
          .filter((item) => item.kind === 'file')
          .map(async (item) => {
            try {
              let files: File[] = [];
              let generator: AsyncGenerator<File>;

              if ('getAsFileSystemHandle' in item) {
                generator = getFilesRecursivelyWithFileSystemAPI(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await (item as any).getAsFileSystemHandle(),
                  state,
                );
              } else if ('webkitGetAsEntry' in item) {
                generator = getFilesRecursivelyWithEntriesAPI(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (item as any).webkitGetAsEntry(),
                  state,
                );
              } else {
                console.warn('Unknown item kind:', 'item=', item);
                return null;
              }

              for await (const file of generator) {
                files.push(file);
              }
              return files;
            } catch (err) {
              console.error(
                `Error while reading file from drag&drop event:`,
                'file=',
                item,
                'error=',
                err,
              );
              return null;
            }
          }),
      );

      const files = result
        .flat()
        .filter((f) => !!f)
        .sort((l, r) =>
          l.name.localeCompare(r.name, undefined, {
            numeric: true,
            sensitivity: 'base',
          }),
        );

      onFiles(files);
    } finally {
      progressBar.remove(task);
    }
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  async function* getFilesRecursivelyWithEntriesAPI(
    entry: FileSystemEntry,
    state: ProgressBarStateItem,
    parent = '',
  ): AsyncGenerator<File> {
    await sleep(100);
    if (entry.isFile) {
      yield await new Promise<File>((resolve, reject) =>
        // @ts-expect-error https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry/file
        entry.file((file) => {
          resolve(
            new File([file], parent + file.name, {
              type: file.type,
              lastModified: file.lastModified,
            }),
          );
        }, reject),
      );
    } else if (entry.isDirectory) {
      // For FileSystemDirectoryEntry, create a reader.
      const reader = (entry as FileSystemDirectoryEntry).createReader();

      // readEntries() is callback-based and might need multiple calls.
      // We'll wrap it in a Promise-based loop.
      const readEntriesBatch = (): Promise<FileSystemEntry[]> => {
        return new Promise((resolve, reject) => {
          reader.readEntries(resolve, reject);
        });
      };

      let entriesBatch: FileSystemEntry[];
      do {
        entriesBatch = await readEntriesBatch();
        state.total += entriesBatch.length;
        for (const subEntry of entriesBatch) {
          // Recursively yield files from sub-entries.
          yield* getFilesRecursivelyWithEntriesAPI(subEntry, state, parent + entry.name + '/');
        }
      } while (entriesBatch.length > 0); // Continue until readEntries returns an empty array
    }

    state.ready++; // Increment ready after entry is processed
  }

  async function* getFilesRecursivelyWithFileSystemAPI(
    entry: FileSystemFileHandle | FileSystemDirectoryHandle,
    state: ProgressBarStateItem,
    parent = '',
  ): AsyncGenerator<File> {
    await sleep(100);
    switch (entry.kind) {
      case 'file': {
        const file = await entry.getFile();
        yield new File([file], parent + file.name, {
          type: file.type,
          lastModified: file.lastModified,
        });
        break;
      }

      case 'directory': {
        const entries: Array<FileSystemFileHandle | FileSystemDirectoryHandle> =
          // @ts-expect-error https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/values
          await Array.fromAsync(entry.values());
        state.total += entries.length;

        for (const handle of entries) {
          yield* getFilesRecursivelyWithFileSystemAPI(handle, state, parent + entry.name + '/');
        }
        break;
      }

      default:
        console.warn('Unknown entry kind:', 'entry=', entry);
        return;
    }

    state.ready++; // Increment ready after entry is processed
  }
</script>

<svelte:window
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
/>

<section
  class:visible={displayDropZone}
  ondrop={handleDrop}
  aria-label={m.Picker_DragAndDropHandler_Label()}
>
  {progressBar.display
    ? m.Picker_DragAndDropHandler_Disabled()
    : m.Picker_DragAndDropHandler_Text()}
</section>

<style lang="scss">
  section {
    display: none;
    box-sizing: border-box;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);

    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--color-text-active);
    font-size: 3rem;

    outline: var(--color-accent) dashed;
    outline-offset: -1rem;
  }

  .visible {
    display: flex;
  }
</style>
