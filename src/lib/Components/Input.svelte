<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  let { value = $bindable(), ...rest }: HTMLInputAttributes = $props();
</script>

<input bind:value {...rest} />

<style lang="scss">
  @use '../../style/mixins.scss';

  input {
    @include mixins.input;
  }
</style>
