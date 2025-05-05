<script lang="ts">
  import DirectoryPickerButton from '$lib/Components/FilePicker/DirectoryPickerButton.svelte';
  import DragAndDropHandler from '$lib/Components/FilePicker/DragAndDropHandler.svelte';
  import ClipboardPasteButton from '$lib/Components/FilePicker/ClipboardPasteButton.svelte';
  import ZipArchivePickerButton from '$lib/Components/FilePicker/ZipArchivePickerButton.svelte';
  import ImagesPickerButton from '$lib/Components/FilePicker/ImagesPickerButton.svelte';
  import ClipboardPasteHandler from '$lib/Components/FilePicker/ClipboardPasteHandler.svelte';
  import type { LocalFilesPickerProps } from '$lib/LocalFilesPickerProps';
  import { m } from '$lib/paraglide/messages.js';

  const { ...rest }: LocalFilesPickerProps = $props();
</script>

<section>
  <h1>{m.Picker_LocalFilePicker_Header()}</h1>

  <div>
    <ImagesPickerButton {...rest} />
    <DirectoryPickerButton {...rest} />
    <ZipArchivePickerButton {...rest} />
    <ClipboardPasteButton {...rest} />
    <ClipboardPasteHandler {...rest} />
    <DragAndDropHandler {...rest} />
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
