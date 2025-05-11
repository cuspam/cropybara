<script lang="ts">
  import Select from '$lib/Components/Select.svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
    label: Snippet;
    bottom?: Snippet;
  } & HTMLSelectAttributes;
  let { value = $bindable(), children, label, bottom, ...rest }: Props = $props();
</script>

<label>
  <span class="label">{@render label()}:</span>
  <Select bind:value {...rest}>
    {@render children()}
  </Select>
  <span class="bottom">
    {#if bottom}
      {@render bottom()}
    {/if}
  </span>
</label>

<style lang="scss">
  label {
    display: flex;
    flex-direction: column;
    user-select: none;
  }

  .label {
    padding-bottom: 0.3em;
  }

  .bottom {
    line-height: 1em;
    padding-top: 0.5em;
  }
</style>
