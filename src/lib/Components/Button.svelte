<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  const { children, ...rest }: HTMLButtonAttributes & { children: Snippet } = $props();
</script>

<button {...rest}>
  {@render children()}
</button>

<style lang="scss">
  @use '../../style/mixins.scss';

  button {
    @include mixins.button;
  }
</style>
