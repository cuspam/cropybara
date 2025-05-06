<script lang="ts">
  import DirectoryPickerButton from '$lib/Components/FilePicker/DirectoryPickerButton.svelte';
  import DragAndDropHandler from '$lib/Components/FilePicker/DragAndDropHandler.svelte';
  import ClipboardPasteButton from '$lib/Components/FilePicker/ClipboardPasteButton.svelte';
  import ZipArchivePickerButton from '$lib/Components/FilePicker/ZipArchivePickerButton.svelte';
  import ImagesPickerButton from '$lib/Components/FilePicker/ImagesPickerButton.svelte';
  import ClipboardPasteHandler from '$lib/Components/FilePicker/ClipboardPasteHandler.svelte';
  import type { LocalFilesPickerProps } from '$lib/LocalFilesPickerProps';
  import { m } from '$lib/paraglide/messages.js';
  import { AlertsLevel, AlertsState } from '$lib/States/AlertsState.svelte';
  import { ProgressBarState } from '$lib/States/ProgressBarState.svelte';
  import { FileTypes } from '$lib/FileTypes';
  import { WorkerZipArchiveReader } from '$lib/ZipArchiveReader/WorkerZipArchiveReader';
  import type {
    ZipArchiveReaderErrorEvent,
    ZipArchiveReaderEvent,
    ZipArchiveReaderFileEvent,
  } from '$lib/ZipArchiveReader/ZipArchiveReaderEvent';
  import { AsyncZipArchiveReader } from '$lib/ZipArchiveReader/AsyncZipArchiveReader';
  import pLimit from 'p-limit';

  const alerts = AlertsState.use();
  const progressBar = ProgressBarState.use();
  const { onFiles, ...rest }: LocalFilesPickerProps = $props();
  const queue = pLimit(navigator?.hardwareConcurrency ?? 4);

  function handleFiles(files: File[]) {
    if (files.length === 0) {
      alerts.display(AlertsLevel.Warning, m.Picker_LocalFilePicker_NoFilesSelected());
      return;
    }

    const filesPromises = files.map(async (file) => {
      if (FileTypes.isZipArchive(file)) {
        return queue(() => extractZipArchive(file));
      } else {
        return file;
      }
    });

    Promise.all(filesPromises)
      .then((results) => {
        const images = results.flat().filter((file) => {
          if (file.name.startsWith('.') || file.name.includes('/.')) {
            // Ignore hidden files and files in hidden directories
            return false;
          }

          if (!file.type.startsWith('image/')) {
            // Ignore non-image files
            alerts.display(
              AlertsLevel.Error,
              m.Picker_LocalFilePicker_ErrorInvalidFileType({
                name: file.name,
                type: file.type,
              }),
            );
            return false;
          }

          return true;
        });

        onFiles(images);
      })
      .catch((error) => {
        alerts.display(
          AlertsLevel.Error,
          m.Picker_LocalFilePicker_ErrorProcessingFiles({
            error: error instanceof Error ? error.message : String(error),
          }),
        );
      });
  }

  function isResultEvent(result: ZipArchiveReaderEvent): result is ZipArchiveReaderFileEvent {
    return 'file' in result;
  }

  function isErrorEvent(result: ZipArchiveReaderEvent): result is ZipArchiveReaderErrorEvent {
    return 'error' in result;
  }

  async function extractZipArchive(file: File): Promise<File[]> {
    const state = $state({ total: 1, ready: 0 });
    const task = () => state;
    progressBar.add(task);

    const reader =
      typeof Worker === 'undefined' ? new AsyncZipArchiveReader() : new WorkerZipArchiveReader();

    try {
      const unzipped: File[] = [];
      for await (const event of reader.read(file)) {
        state.total = event.total + 1; // number of files in archive + 1 for the archive itself
        state.ready = event.ready;

        if (isResultEvent(event)) {
          unzipped.push(event.file);
        } else if (isErrorEvent(event)) {
          alerts.display(
            AlertsLevel.Error,
            m.Picker_LocalFilePicker_ErrorUnzippingFile({
              error: event.error,
              name: event.filename,
            }),
          );
        }
      }
      state.ready++;
      return unzipped;
    } finally {
      progressBar.remove(task);
    }
  }
</script>

<section>
  <h1>{m.Picker_LocalFilePicker_Header()}</h1>

  <div>
    <ImagesPickerButton onFiles={handleFiles} {...rest} />
    <DirectoryPickerButton onFiles={handleFiles} {...rest} />
    <ZipArchivePickerButton onFiles={handleFiles} {...rest} />
    <ClipboardPasteButton onFiles={handleFiles} {...rest} />
    <ClipboardPasteHandler onFiles={handleFiles} {...rest} />
    <DragAndDropHandler onFiles={handleFiles} {...rest} />
  </div>
</section>

<style lang="scss">
  h1 {
    text-align: center;
    margin-top: 0;
  }

  div {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5em;
    justify-content: center;
  }
</style>
