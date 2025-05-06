<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
  import LabeledInput from '$lib/Components/LabeledInput.svelte';
  import Button from '$lib/Components/Button.svelte';
  import LabeledCheckbox from '$lib/Components/LabeledCheckbox.svelte';

  type Props = {
    widths: Array<[number, string[]]>;
    onCancel: () => void;
    onSubmit: (options: { name: string; limit: number }) => void;
  };

  const { onCancel, onSubmit, widths }: Props = $props();
  let name = $state(`cropybara-${Math.round(Date.now() / 1000)}`);
  let limit = $state(20_000);
  let forceWidth = $state(false);

  function handleReset(e: Event) {
    e.preventDefault();
    onCancel();
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    onSubmit({ name, limit });
  }
</script>

<main>
  <form onreset={handleReset} onsubmit={handleSubmit}>
    <h1>{m.ConfigScreen_Header()}</h1>
    <LabeledInput bind:value={name} required autofocus
      >{m.ConfigScreen_ProjectName_Label()}</LabeledInput
    >
    <LabeledInput bind:value={limit} required type="number" min="1" max="65000"
      >{m.ConfigScreen_HeightLimit_Label()}</LabeledInput
    >

    {#if widths.length > 1}
      <div class="force-width-notice" role="alert">
        {m.ConfigScreen_ForceWithNotice_Description({
          length: widths[0][1].length,
          width: widths[0][0],
        })}: {widths
          .slice(1)
          .map(([width, files]) =>
            m.ConfigScreen_ForceWithNotice_Exception({ length: files.length, width }),
          )
          .join(', ')}.

        <LabeledCheckbox bind:checked={forceWidth}
          >{m.ConfigScreen_ForceWithNotice_Checkbox_Label({ width: widths[0][0] })}</LabeledCheckbox
        >
      </div>
    {/if}

    <div class="controls">
      <Button type="submit" disabled={!(widths.length === 1 || forceWidth)}
        >{m.ConfigScreen_SubmitButton_Text()}</Button
      >
      <Button type="reset">{m.ConfigScreen_CancelButton_Text()}</Button>
    </div>
  </form>
</main>

<style lang="scss">
  main {
    padding: 0 1em;
  }

  h1 {
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .controls {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
  }

  .force-width-notice {
    color: #b07777;
    background-color: rgba(255, 0, 0, 0.05);
    border: 1px solid rgba(255, 0, 0, 0.25);
    padding: 1em;
    border-radius: var(--input-border-radius);
  }
</style>
