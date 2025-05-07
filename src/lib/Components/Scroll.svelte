<script lang="ts">
  import type { ImageFile } from '$lib/ImageFile';
  import ImageChunk from '$lib/Components/ImageChunk.svelte';
  import { onMount } from 'svelte';

  type Props = {
    images: ReadonlyArray<ImageFile>;
    width: number;
  };

  let { images, width = $bindable() }: Props = $props();

  let scrollElement: HTMLElement;

  onMount(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      // We're only watching one element
      const entry = entries.at(0);
      width = entry?.contentBoxSize[0].inlineSize ?? 0;
    });

    resizeObserver.observe(scrollElement);

    return () => resizeObserver.unobserve(scrollElement);
  });
</script>

<section bind:this={scrollElement} style="max-width: {images[0].width}px">
  {#each images as image, i (i)}
    <ImageChunk {image} />
  {/each}
</section>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
  }
</style>
