<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
  } & HTMLSelectAttributes;
  let { value = $bindable(), children, ...rest }: Props = $props();
</script>

<select bind:value {...rest}>
  {@render children()}
</select>

<style lang="scss">
  @use '../../style/mixins.scss';

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    @include mixins.input;
  }
</style>
