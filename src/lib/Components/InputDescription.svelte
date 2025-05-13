<script lang="ts">
  import type { Snippet } from 'svelte';

  const { children }: { children: Snippet } = $props();
</script>

<small>
  {@render children()}
</small>

<style lang="scss">
  small {
    line-height: 1em;
    padding-top: 0.5em;
  }
</style>
