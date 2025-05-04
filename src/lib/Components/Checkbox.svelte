<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  let { checked = $bindable(), ...restProps }: Omit<HTMLInputAttributes, 'type'> = $props();
</script>

<input type="checkbox" bind:checked {...restProps} />

<style lang="scss">
  input {
    appearance: none;
    font-size: inherit;
    border: 1px solid var(--color-border);
    border-radius: 0.25em;
    width: 1em;
    height: 1em;

    background-color: var(--input-background);
    background-origin: border-box;
    background-position-x: 50%;
    background-position-y: 50%;
    background-repeat: no-repeat;
    background-size: 0.5em 0.5em;
    margin: 0;
  }

  input:hover:not(:disabled) {
    border-color: var(--color-border-active);
  }

  input:checked {
    background-image: url("data:image/svg+xml,%3csvg aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 12'%3e %3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M1 5.917 5.724 10.5 15 1.5'/%3e %3c/svg%3e");
  }

  input:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  input:disabled {
    border-color: var(--color-border-disabled);
  }

  input:checked:disabled {
    background-image: url("data:image/svg+xml,%3csvg aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 12'%3e %3cpath stroke='gray' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M1 5.917 5.724 10.5 15 1.5'/%3e %3c/svg%3e");
  }
</style>
