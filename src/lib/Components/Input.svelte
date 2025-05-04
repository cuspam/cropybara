<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  const { ...rest }: HTMLInputAttributes = $props();
</script>

<input {...rest} />

<style lang="scss">
  input {
    font-family: inherit;
    border-radius: var(--input-border-radius);
    padding: var(--input-padding-vertical) var(--input-padding-horizontal);
    background: rgba(0, 0, 0, 0.5);
    font-size: 1rem;
    font-weight: normal;
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  input:disabled {
    color: var(--color-text-muted);
    border-color: var(--color-border-disabled);
  }

  input:focus {
    outline: none;
    border-color: var(--color-accent);
    color: var(--color-text-active);
  }
</style>
