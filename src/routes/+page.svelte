<script lang="ts">
  import { setLocale } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages.js';
  import Input from '$lib/Components/Input.svelte';
  import Button from '$lib/Components/Button.svelte';
  import Checkbox from '$lib/Components/Checkbox.svelte';
  import LabeledCheckbox from '$lib/Components/LabeledCheckbox.svelte';
  import LabeledInput from '$lib/Components/LabeledInput.svelte';
  import { LocalStorageStore } from '$lib/LocalStorageStore.svelte';
  import FileInput from '$lib/Components/FileInput.svelte';
  import FileInputButton from '$lib/Components/FileInputButton.svelte';

  let value = $state(16);
  let checked = $state(false);
  let checked2 = $state(false);
  let linput = new LocalStorageStore('test-input', '');
</script>

<section style={`font-size: ${value}px`}>
  <div>
    <Button onclick={() => setLocale('en')}>{m.test_english_btn()}</Button>
    <Button onclick={() => setLocale('ru')}>{m.test_russian_btn()}</Button>
    <Button disabled>Disabled</Button>
  </div>

  <div>
    <Input type="number" bind:value />
    <Input type="text" disabled value={`Value: ${value}`} />
  </div>

  <div>
    <Checkbox bind:checked />
    <Checkbox disabled />
    <Checkbox disabled checked={true} />
  </div>

  <div>
    <LabeledCheckbox bind:checked={checked2}>Important checkbox</LabeledCheckbox>
    <LabeledCheckbox disabled bind:checked={checked2}>Important checkbox</LabeledCheckbox>
  </div>

  <div>
    <LabeledInput bind:value={linput.value}>Some important input</LabeledInput>
    <LabeledInput disabled bind:value={linput.value}>Some other input</LabeledInput>
  </div>

  <div>
    <FileInputButton onFiles={(f) => console.log(f)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-images"
        viewBox="0 0 16 16"
      >
        <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
        <path
          d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z"
        />
      </svg>
      Select images
    </FileInputButton>

    <FileInputButton onFiles={(f) => console.log(f)} disabled>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-images"
        viewBox="0 0 16 16"
      >
        <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
        <path
          d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z"
        />
      </svg>
      Select images
    </FileInputButton>
  </div>
</section>
