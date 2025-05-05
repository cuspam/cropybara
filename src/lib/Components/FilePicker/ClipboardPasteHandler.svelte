<script lang="ts">
  import type { LocalFilesPickerProps } from '$lib/LocalFilesPickerProps';
  import { ProgressBarState } from '$lib/States/ProgressBarState.svelte';

  const progressBar = ProgressBarState.use();
  const { onFiles }: LocalFilesPickerProps = $props();

  function handlePaste(event: ClipboardEvent) {
    if (progressBar.display) return;
    const files = event.clipboardData?.files;
    // Folders from the clipboard might be represented as File objects without a 'type'.
    // Filter them out as we can't handle folder contents here.
    onFiles(Array.from(files ?? []).filter((f) => f.type && f.type.length));
  }
</script>

<svelte:window onpaste={handlePaste} />
