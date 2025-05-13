<script lang="ts">
  import Select from '$lib/Components/Select.svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  import InputDescription from '$lib/Components/InputDescription.svelte';

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
  {#if bottom}
    <InputDescription>
      {@render bottom()}
    </InputDescription>
  {/if}
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
</style>
