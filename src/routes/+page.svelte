<script lang="ts">
  import { setLocale } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages.js';
  import Input from '$lib/Components/Input.svelte';
  import Button from '$lib/Components/Button.svelte';
  import Checkbox from '$lib/Components/Checkbox.svelte';
  import LabeledCheckbox from '$lib/Components/LabeledCheckbox.svelte';
  import LabeledInput from '$lib/Components/LabeledInput.svelte';
  import { LocalStorageStore } from '$lib/LocalStorageStore.svelte';
  import ImagesPickerButton from '$lib/Components/FilePicker/ImagesPickerButton.svelte';

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
    <ImagesPickerButton />
  </div>
</section>
