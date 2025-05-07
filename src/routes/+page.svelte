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
    config = null;
  }

  async function handleConfig(cfg: { name: string; limit: number }) {
    const outliers = images.filter((image) => image.width !== widths[0][0]);

    if (outliers.length > 0) {
      const resizer = new AsyncImageResizer();
      const controller = new AbortController();

      const state = $state({ total: outliers.length, ready: 0 });
      const task = () => state;
      progressBar.add(task);

      try {
        await Promise.all(
          outliers.map(async (image) => {
            try {
              const index = images.indexOf(image);
              images[index] = await resizer.resize(image, widths[0][0], controller.signal);
            } finally {
              state.ready++;
            }
          }),
        );
      } finally {
        progressBar.remove(task);
      }
    }

    config = cfg;
  }

  function handleCuts(cuts: ReadonlyArray<number>) {
    console.log('Cuts:', cuts);
  }
</script>

{#if images.length === 0}
  <UploadImagesScreen onImages={(i) => (images = i)} />
{:else if !config}
  <ConfigScreen {widths} onCancel={handleCancel} onSubmit={handleConfig} />
{:else}
  <EditorScreen {images} limit={config.limit} onCancel={handleCancel} onSubmit={handleCuts} />
{/if}
