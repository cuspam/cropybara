<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
  import LabeledInput from '$lib/Components/LabeledInput.svelte';
  import Button from '$lib/Components/Button.svelte';
  import LabeledCheckbox from '$lib/Components/LabeledCheckbox.svelte';
  import { ProgressBarState } from '$lib/States/ProgressBarState.svelte';
  import { onMount } from 'svelte';
  import { Analytics } from '$lib/Analytics';
  import LabeledSelect from '$lib/Components/LabeledSelect.svelte';
  import { ConfigDenoiser, ConfigDetector, type ConfigState } from '$lib/ConfigState';
  import { OnlineState } from '$lib/States/OnlineState.svelte';
  import { AlertsState } from '$lib/States/AlertsState.svelte';
  import { AlertsLevel } from '$lib/States/AlertsState.svelte.js';

  type Props = {
    widths: Array<[number, string[]]>;
    onCancel: () => void;
    onSubmit: (options: ConfigState) => void;
  };

  const { onCancel, onSubmit, widths }: Props = $props();
  const progressBar = ProgressBarState.use();
  const online = OnlineState.use();
  const alerts = AlertsState.use();
  let name = $state(`cropybara-${Math.round(Date.now() / 1000)}`);
  let limit = $state(20_000);
  let forceWidth = $state(false);

  $inspect(online.state);

  let denoiser: ConfigDenoiser = $state(ConfigDenoiser.Off);

  let detectors = [ConfigDetector.Manual, ConfigDetector.PixelComparison];
  let detectorType: ConfigDetector = $state(ConfigDetector.PixelComparison);
  let pcDetectorSensitivity = $state(90);
  let pcDetectorStep = $state(5);
  let pcDetectorMargin = $state(5);

  function handleReset(e: Event) {
    e.preventDefault();
    onCancel();
  }

  function handleSubmit(e: Event) {
    e.preventDefault();

    if (denoiser !== ConfigDenoiser.Off && !online.state) {
      alerts.display(AlertsLevel.Error, m.ConfigScreen_Denoiser_Alert_Offline());
      return;
    }

    onSubmit({
      name,
      limit,
      detector: detectorType,
      step: pcDetectorStep,
      sensitivity: pcDetectorSensitivity,
      margins: pcDetectorMargin,
      denoiser,
    });
  }

  onMount(() => {
    Analytics.trackScreen('ConfigScreen');
  });
</script>

<svelte:head>
  <title>{m.ConfigScreen_Title()}</title>
</svelte:head>

<main>
  <form onreset={handleReset} onsubmit={handleSubmit}>
    <h1>{m.ConfigScreen_Header()}</h1>
    <LabeledInput bind:value={name} required autofocus
      >{m.ConfigScreen_ProjectName_Label()}</LabeledInput
    >
    <LabeledInput bind:value={limit} required type="number" min="1" max="65000"
      >{m.ConfigScreen_HeightLimit_Label()}</LabeledInput
    >

    <LabeledSelect bind:value={denoiser}>
      {#snippet label()}
        {m.ConfigScreen_Denoiser_Select_Label()}
      {/snippet}

      {#snippet bottom()}
        {#if denoiser === ConfigDenoiser.Unjpeg}
          <small
            ><span style="color: white">unjpeg</span> - {m.ConfigScreen_Denoiser_Select_Bottom_Unjpeg()}</small
          >
        {/if}
      {/snippet}

      <option value={ConfigDenoiser.Off}>{m.ConfigScreen_Denoiser_Select_Option_Off()}</option>
      <option value={ConfigDenoiser.Unjpeg} disabled={!online.state}>unjpeg ✨</option>
    </LabeledSelect>

    <LabeledSelect bind:value={detectorType}>
      {#snippet label()}
        {m.ConfigScreen_DetectorType_Label()}
      {/snippet}

      {#each detectors as detector (detector)}
        <option value={detector}>{m[`ConfigScreen_Detector_Name_${detector}`]()}</option>
      {/each}
    </LabeledSelect>

    {#if detectorType === ConfigDetector.PixelComparison}
      <LabeledInput type="number" min={1} max={100} bind:value={pcDetectorSensitivity} required
        >{m.ConfigScreen_PCDetector_Sensitivity_Label()}</LabeledInput
      >
      <LabeledInput type="number" min={1} bind:value={pcDetectorStep} required
        >{m.ConfigScreen_PCDetector_Step_Label()}</LabeledInput
      >
      <LabeledInput
        type="number"
        min={0}
        max={Math.floor(widths[0][0] / 2)}
        required
        bind:value={pcDetectorMargin}>{m.ConfigScreen_PCDetector_Margins_Label()}</LabeledInput
      >
    {/if}

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
      <Button type="submit" disabled={!(widths.length === 1 || forceWidth) || progressBar.display}
        >{m.ConfigScreen_SubmitButton_Text()}</Button
      >
      <Button type="reset" disabled={progressBar.display}
        >{m.ConfigScreen_CancelButton_Text()}</Button
      >
    </div>
  </form>
</main>

<style lang="scss">
  main {
    padding: 0 1em;
    margin: 0 auto;
    max-width: 600px;
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

  small {
  }
</style>
