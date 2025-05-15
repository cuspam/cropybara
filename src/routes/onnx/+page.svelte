<script lang="ts">
  import FileInputButton from '$lib/Components/FileInputButton.svelte';
  import { ImageFile } from '$lib/ImageFile';
  import { ONNXDenoiser } from '$lib/Denoiser/ONNXDenoiser';

  let imageUrl: string | undefined = $state();
  let duration = $state(0);

  async function handleFiles(files: File[]) {
    const imageFile = await ImageFile.fromFile(files[0]);
    const denoiser = new ONNXDenoiser();
    performance.mark('denoiser-start');
    imageUrl = await denoiser.process(imageFile);
    performance.mark('denoiser-end');
    const denoiserDuration = performance.measure(
      'denoiser-duration',
      'denoiser-start',
      'denoiser-end',
    );
    duration = denoiserDuration.duration;
  }
</script>

<FileInputButton onFiles={handleFiles}>Image</FileInputButton>

Duration: {duration.toFixed(2)} ms
{#if imageUrl}
  <img src={imageUrl} />
{/if}
