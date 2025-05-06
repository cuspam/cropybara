<script lang="ts">
  import type { LocalFilesPickerProps } from '$lib/LocalFilesPickerProps';
  import { ProgressBarState } from '$lib/States/ProgressBarState.svelte';

  const progressBar = ProgressBarState.use();
  const { onFiles }: LocalFilesPickerProps = $props();

  $effect(() => {
    (async () => {
      const state = $state({ total: 1, ready: 0 });
      const task = () => state;
      progressBar.add(task);
      try {
        if (location.search.includes('source=share-target')) {
          const mediaCache = await caches.open('web-share-target-files');
          const keys = await mediaCache.keys();
          const sortedKeys = keys
            .map((k) => k.url)
            .sort((l, r) =>
              l.localeCompare(r, undefined, {
                numeric: true,
                sensitivity: 'base',
              }),
            );

          const files: File[] = [];
          for (const key of sortedKeys) {
            const response = await mediaCache.match(key);
            if (!response) continue;

            const blob = await response.blob();
            files.push(
              new File([blob], response.headers.get('X-Cropybara-Filename') ?? `file-${key}.bin`, {
                type: response.headers.get('Content-Type') ?? 'image/png',
                lastModified: Date.now(),
              }),
            );
          }

          onFiles(files);
          await mediaCache.delete('web-share-target-files');
        }
      } finally {
        progressBar.remove(task);
      }
    })();
  });
</script>
