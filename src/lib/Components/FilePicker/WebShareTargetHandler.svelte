<script lang="ts">
  import type { LocalFilesPickerProps } from '$lib/LocalFilesPickerProps';

  const { onFiles }: LocalFilesPickerProps = $props();

  $effect(() => {
    (async () => {
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
    })();
  });
</script>
