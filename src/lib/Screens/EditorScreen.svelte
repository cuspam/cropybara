<script lang="ts">
  import type { ImageFile } from '$lib/ImageFile';
  import Scroll from '$lib/Components/Scroll.svelte';
  import { onMount } from 'svelte';
  import { CutsState } from '$lib/States/CutsState.svelte';
  import Cuts from '$lib/Components/Cuts.svelte';

  type Props = {
    images: ReadonlyArray<ImageFile>;
    limit: number;
  };
  const { images, limit }: Props = $props();
  const height = $derived(images.reduce((acc, img) => acc + img.height, 0));
  const cuts = $derived(new CutsState(50, limit, height, 1));
  // Width of the image
  const imagesWidth = $derived(images.length > 0 ? images[0].width : 0);
  // Width with which images are displayed on the user's screen
  let actualWidth = $state(imagesWidth);
  // Current zoom level
  const zoom = $derived(actualWidth / imagesWidth);
  // Current scroll position
  let scrollY = $state(0);
</script>

<svelte:window bind:scrollY />

<main>
  <Scroll {images} bind:width={actualWidth} />
  <Cuts {cuts} {zoom} />
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }
</style>
