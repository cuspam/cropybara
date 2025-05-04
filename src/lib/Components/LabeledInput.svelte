<script lang="ts">
  import Input from '$lib/Components/Input.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  type Props = HTMLInputAttributes & {
    children: Snippet;
  };

  let { value = $bindable(), children, ...rest }: Props = $props();
</script>

<label>
  <span>{@render children()}:</span>
  <Input bind:value {...rest} />
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
