<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
  import type { LocalFilesPickerProps } from '$lib/LocalFilesPickerProps';

  const { onFiles }: LocalFilesPickerProps = $props();

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

    const items = Array.from(event.dataTransfer?.items ?? []);

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
              );
            } else if ('webkitGetAsEntry' in item) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              generator = getFilesRecursivelyWithEntriesAPI((item as any).webkitGetAsEntry());
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
  }

  async function* getFilesRecursivelyWithEntriesAPI(
    entry: FileSystemEntry,
    parent = '',
  ): AsyncGenerator<File> {
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
        for (const subEntry of entriesBatch) {
          // Recursively yield files from sub-entries.
          yield* getFilesRecursivelyWithEntriesAPI(subEntry, parent + entry.name + '/');
        }
      } while (entriesBatch.length > 0); // Continue until readEntries returns an empty array
    }
  }

  async function* getFilesRecursivelyWithFileSystemAPI(
    entry: FileSystemFileHandle | FileSystemDirectoryHandle,
    parent = '',
  ): AsyncGenerator<File> {
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
        // @ts-expect-error https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/values
        const entries = entry.values();

        for await (const handle of entries) {
          yield* getFilesRecursivelyWithFileSystemAPI(handle, parent + entry.name + '/');
        }
        break;
      }

      default:
        console.warn('Unknown entry kind:', 'entry=', entry);
        return;
    }
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
  {m.Picker_DragAndDropHandler_Text()}
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
