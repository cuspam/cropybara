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

  const alerts = AlertsState.use();
  const { onFiles, ...rest }: LocalFilesPickerProps = $props();

  function handleFiles(files: File[]) {
    if (files.length === 0) {
      alerts.display(AlertsLevel.Warning, m.Picker_LocalFilePicker_NoFilesSelected());
      return;
    }

    onFiles(files);
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
