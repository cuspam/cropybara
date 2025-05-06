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
  import { ZipArchiveReader } from '$lib/ZipArchiveReader';
  import { ProgressBarState } from '$lib/States/ProgressBarState.svelte';
  import { FileTypes } from '$lib/FileTypes';

  const alerts = AlertsState.use();
  const progressBar = ProgressBarState.use();
  const { onFiles, ...rest }: LocalFilesPickerProps = $props();

  function handleFiles(files: File[]) {
    if (files.length === 0) {
      alerts.display(AlertsLevel.Warning, m.Picker_LocalFilePicker_NoFilesSelected());
      return;
    }

    const filesPromises = files.map(async (file) => {
      if (FileTypes.isZipArchive(file)) {
        return extractZipArchive(file);
      } else {
        return file;
      }
    });

    Promise.all(filesPromises)
      .then((files) => onFiles(files.flat()))
      .catch((error) => {
        alerts.display(
          AlertsLevel.Error,
          m.Picker_LocalFilePicker_ErrorProcessingFiles({
            error: error instanceof Error ? error.message : String(error),
          }),
        );
      });
  }

  async function extractZipArchive(file: File): Promise<File[]> {
    const state = $state({ total: 1, ready: 0 });
    const task = () => state;
    progressBar.add(task);

    try {
      const unzipped: File[] = [];
      for await (const event of ZipArchiveReader.read(file)) {
        state.total = event.total + 1; // number of files in archive + 1 for the archive itself
        state.ready = event.ready;

        if ('file' in event && event.file instanceof File) {
          unzipped.push(event.file);
        }

        if ('error' in event) {
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
