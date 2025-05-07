<script lang="ts">
  import type { ImageFile } from '$lib/ImageFile';
  import ImageChunk from '$lib/Components/ImageChunk.svelte';

  type Props = {
    images: ReadonlyArray<ImageFile>;
  };

  const { images }: Props = $props();
</script>

<section>
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
