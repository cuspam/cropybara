<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  const { children, ...rest }: HTMLButtonAttributes & { children: Snippet } = $props();
</script>

<button {...rest}>
  {@render children()}
</button>

<style lang="scss">
  button {
    font-family: inherit;
    display: inline-flex;
    border-radius: var(--input-border-radius);
    padding: var(--input-padding-vertical) var(--input-padding-horizontal);
    background: transparent;
    font-size: 1rem;
    font-weight: normal;
    color: var(--color-text);
    border: 1px solid var(--color-border);
    user-select: none;
  }

  button:disabled {
    border-color: var(--color-border-disabled);
    color: var(--color-text-muted);
  }

  button:hover:not(:disabled),
  button:focus {
    border-color: var(--color-border-focus);
    color: var(--color-text-active);
  }

  button:active:not(:disabled) {
    background: rgba(0, 0, 0, 0.5);
    border-color: var(--color-accent);
  }

  button:focus {
    outline: none;
    border-color: var(--color-accent);
  }
</style>
