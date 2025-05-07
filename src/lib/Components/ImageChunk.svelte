<script lang="ts">
  import type { ImageFile } from '$lib/ImageFile';
  import { onDestroy } from 'svelte';

  const { image }: { image: ImageFile } = $props();
  const src = URL.createObjectURL(image);

  onDestroy(() => URL.revokeObjectURL(src));
</script>

<img {src} loading="lazy" width={image.width} height={image.height} alt={image.name} />

<style>
  img {
    max-width: 100%;
    height: auto;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }
</style>
