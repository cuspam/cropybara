<script lang="ts">
  import { setLocale } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages.js';
  import Input from '$lib/Components/Input.svelte';
  import Button from '$lib/Components/Button.svelte';

  let value = $state(0);
</script>

<div>
  <Button onclick={() => setLocale('en')}>{m.test_english_btn()}</Button>
  <Button onclick={() => setLocale('ru')}>{m.test_russian_btn()}</Button>
  <Button disabled>Disabled</Button>
</div>

<div>
  <Input type="number" bind:value />
  <Input type="text" disabled value={`Value: ${value}`} />
</div>
