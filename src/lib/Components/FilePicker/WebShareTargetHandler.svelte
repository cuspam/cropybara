<script lang="ts">
  import type { LocalFilesPickerProps } from '$lib/LocalFilesPickerProps';
  import { ProgressBarState } from '$lib/States/ProgressBarState.svelte';

  const progressBar = ProgressBarState.use();
  const { onFiles }: LocalFilesPickerProps = $props();

  $effect(() => {
    (async () => {
      if (location.search.includes('source=share-target')) {
        const keys = await caches.keys();
        const mediaCache = await caches.open(keys.filter((key) => key.startsWith('media'))[0]);
        const image = await mediaCache.match('shared-image');

        if (image) {
          console.log('Image:', image);
          const blob = await image.blob();
          await mediaCache.delete('shared-image');
          onFiles([new File([blob], 'image.png', { type: 'image/png', lastModified: Date.now() })]);
        }
      }
    })();
  });
</script>
