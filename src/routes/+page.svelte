<script lang="ts">
  import UploadImagesScreen from '$lib/Screens/UploadImagesScreen.svelte';
  import type { ImageFile } from '$lib/ImageFile';
  import ConfigScreen from '$lib/Screens/ConfigScreen.svelte';
  import EditorScreen from '$lib/Screens/EditorScreen.svelte';
  import { AsyncImageResizer } from '$lib/ImageResizer/AsyncImageResizer';
  import { ProgressBarState } from '$lib/States/ProgressBarState.svelte';

  let images: ImageFile[] = $state([]);
  let config: { name: string; limit: number } | null = $state(null);
  const progressBar = ProgressBarState.use();

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

  async function handleConfig(cfg: { name: string; limit: number }) {
    config = cfg;

    const resizer = new AsyncImageResizer();
    const controller = new AbortController();

    const state = $state({ total: images.length, ready: 0 });
    const task = () => state;
    progressBar.add(task);

    try {
      await Promise.all(
        images.map(async (image) => {
          try {
            return await resizer.resize(image, 2000, controller.signal);
          } finally {
            state.ready++;
          }
        }),
      );
    } finally {
      progressBar.remove(task);
    }
  }
</script>

{#if images.length === 0}
  <UploadImagesScreen onImages={(i) => (images = i)} />
{:else if !config}
  <ConfigScreen {widths} onCancel={handleCancel} onSubmit={handleConfig} />
{:else}
  <EditorScreen {images} limit={config.limit} />
{/if}
