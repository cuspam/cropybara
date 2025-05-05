<script lang="ts">
  import { ProgressBarState } from '$lib/States/ProgressBarState.svelte';
  import { fade } from 'svelte/transition';
  import { tick } from 'svelte';

  const progressBar = ProgressBarState.use();

  const width = $derived(((progressBar.progress + 0.02) / 1.02) * 100);
  let display = $state(progressBar.display);

  $effect(() => {
    /**
     * As soon as the block enters the "outro" mode (triggered by {#if}), the node "freezes":
     * Svelte no longer patches its DOM properties until the out animation finishes.
     * Therefore, for the progress bar's width change animation to start executing,
     * we change the display value only after the new width has been written to the DOM.
     */
    const value = progressBar.display;
    tick().then(() => {
      display = value;
    });
  });
</script>

{#if display}
  <div style="width: {width}%" out:fade={{ duration: 200 }}></div>
{/if}

<style lang="scss">
  div {
    position: fixed;
    left: 0;
    top: 0;
    height: 0.25rem;
    background: var(--color-accent);
    transition: width 0.2s ease-in-out;
  }
</style>
