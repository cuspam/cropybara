<script lang="ts">
  import UploadImagesScreen from '$lib/Screens/UploadImagesScreen.svelte';
  import type { ImageFile } from '$lib/ImageFile';
  import ConfigScreen from '$lib/Screens/ConfigScreen.svelte';
  import EditorScreen from '$lib/Screens/EditorScreen.svelte';

  let images: ImageFile[] = $state([]);
  let config: { name: string; limit: number } | null = $state(null);

  let widths = $derived(
    Object.entries(
      images.reduce(
        (acc, image) => {
          if (!(image.width in acc)) acc[image.width] = [];
          acc[image.width].push(image.name);
          return acc;
        },
        {} as Record<number, string[]>,
      ),
    )
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([k, v]) => [parseInt(k, 10), v] as [number, string[]]),
  );

  function handleCancel() {
    images = [];
  }

  function handleConfig(cfg: { name: string; limit: number }) {
    config = cfg;
  }
</script>

{#if images.length === 0}
  <UploadImagesScreen onImages={(i) => (images = i)} />
{:else if !config}
  <ConfigScreen {widths} onCancel={handleCancel} onSubmit={handleConfig} />
{:else}
  <EditorScreen {images} />
{/if}
