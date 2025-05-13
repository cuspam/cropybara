<script lang="ts">
  import Input from '$lib/Components/Input.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  import InputDescription from '$lib/Components/InputDescription.svelte';

  type Props = HTMLInputAttributes & {
    children: Snippet;
    bottom?: Snippet;
  };

  let { value = $bindable(), children, bottom, ...rest }: Props = $props();
</script>

<label>
  <span>{@render children()}:</span>
  <Input bind:value {...rest} />
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

  span {
    padding-bottom: 0.3em;
  }
</style>
