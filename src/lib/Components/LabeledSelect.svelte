<script lang="ts">
  import Select from '$lib/Components/Select.svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
    label: Snippet;
  } & HTMLSelectAttributes;
  let { value = $bindable(), children, label, ...rest }: Props = $props();
</script>

<label>
  <span>{@render label()}:</span>
  <Select bind:value {...rest}>
    {@render children()}
  </Select>
</label>

<style lang="scss">
  label {
    display: flex;
    flex-direction: column;
    user-select: none;
  }

  span {
    padding-bottom: 0.3em;
  }
</style>
