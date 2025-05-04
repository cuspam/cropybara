<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  import Checkbox from '$lib/Components/Checkbox.svelte';

  type Props = Omit<HTMLInputAttributes, 'type'> & {
    children: Snippet;
  };

  let { children, checked = $bindable(), ...rest }: Props = $props();
</script>

<label>
  <span class="checkbox-wrapper">
    <Checkbox bind:checked {...rest} />
  </span>
  {@render children()}
</label>

<style lang="scss">
  label {
    display: flex;
    align-items: center;
    user-select: none;
    padding: var(--input-element-padding-vertical) 0;
  }

  .checkbox-wrapper {
    margin-right: 0.4em;
    display: inline-flex;
    align-items: center;
  }
</style>
