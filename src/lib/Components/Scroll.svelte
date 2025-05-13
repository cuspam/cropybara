<script lang="ts">
  import type { ImageFile } from '$lib/ImageFile';
  import ImageChunk from '$lib/Components/ImageChunk.svelte';

  type Props = {
    images: ReadonlyArray<ImageFile>;
    width: number;
  };

  let { images, width }: Props = $props();
</script>

<section style="width: {width}px">
  {#each images as image, i (i)}
    <ImageChunk {image} />
  {/each}
</section>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
