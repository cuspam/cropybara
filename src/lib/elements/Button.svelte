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
    display: inline-flex;
    border-radius: 0.25em;
    padding: 0.5em 1em;
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
    background: rgba(0, 0, 0, 0.25);
    border-color: var(--color-border-active);
  }
</style>
