<script lang="ts">
  import { setLocale } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages.js';
  import Button from '$lib/elements/Button.svelte';
</script>

<div>
  <Button onclick={() => setLocale('en')}>{m.test_english_btn()}</Button>
  <Button onclick={() => setLocale('ru')}>{m.test_russian_btn()}</Button>
  <Button disabled>Disabled</Button>
</div>
