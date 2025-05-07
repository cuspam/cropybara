<script lang="ts">
  import type { ImageFile } from '$lib/ImageFile';
  import Scroll from '$lib/Components/Scroll.svelte';

  type Props = {
    images: ReadonlyArray<ImageFile>;
  };
  const { images }: Props = $props();
</script>

<Scroll {images} />

<style lang="scss"></style>
