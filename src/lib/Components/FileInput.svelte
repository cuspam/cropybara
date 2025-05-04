<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  type Props = Omit<HTMLInputAttributes, 'type'> & {
    onFiles: (files: File[]) => void;
  };

  const { onFiles, onchange, ...rest }: Props = $props();

  function handleFiles(event: Event & { currentTarget: HTMLInputElement }) {
    if (onchange) {
      onchange(event);
    }

    const files = event.currentTarget.files;
    if (files) {
      onFiles(Array.from(files));
    }

    if (event.currentTarget) {
      event.currentTarget.value = '';
    }
  }
</script>

<input type="file" {...rest} onchange={handleFiles} />

<style>
  input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap; /* Added line */
    border-width: 0;
  }
</style>
