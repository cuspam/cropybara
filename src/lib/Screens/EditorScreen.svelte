<script lang="ts">
  import type { ImageFile } from '$lib/ImageFile';
  import Scroll from '$lib/Components/Scroll.svelte';
  import { onMount } from 'svelte';
  import { CutsState } from '$lib/States/CutsState.svelte';
  import Cuts from '$lib/Components/Cuts.svelte';
  import { Analytics } from '$lib/Analytics';

  type Props = {
    images: ReadonlyArray<ImageFile>;
    limit: number;
    onCancel: () => void;
    onSubmit: (cuts: ReadonlyArray<number>) => void;
    cutsInit: number[];
  };
  const { images, limit, onCancel, onSubmit, cutsInit }: Props = $props();
  const height = $derived(images.reduce((acc, img) => acc + img.height, 0));
  const cuts = new CutsState(50, limit, height, 1, cutsInit);
  // Width of the image
  const imagesWidth = $derived(images.length > 0 ? images[0].width : 0);
  // Width with which images are displayed on the user's screen
  let actualWidth = $state(imagesWidth);
  // Current zoom level
  const zoom = $derived(actualWidth / imagesWidth);
  // Current scroll position
  let scrollY = $state(0);

  onMount(() => {
    Analytics.trackScreen('EditorScreen');
  });
</script>

<svelte:window bind:scrollY />

<main>
  <Scroll {images} bind:width={actualWidth} />
  <Cuts {cuts} {zoom} />

  <button class="save" aria-label="Save" onclick={() => onSubmit(cuts.cuts)}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
      <path
        d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"
      />
      <path
        d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"
      />
    </svg>
  </button>

  <button class="close" aria-label="Close" onclick={onCancel}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
      <path
        d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
      />
    </svg>
  </button>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  button {
    position: fixed;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    cursor: pointer;
    padding: 0;
    z-index: 2;
    border: 2px solid var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button:hover,
  button:focus {
    background-color: var(--color-accent);
  }

  button svg {
    width: 2rem;
    height: 2rem;
  }

  .close {
    left: 2rem;
    top: 2rem;
  }

  .save {
    right: 2rem;
    top: 2rem;
  }

  .save svg {
    width: 1.2rem;
    height: 1.2rem;
  }
</style>
