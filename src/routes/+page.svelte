<script lang="ts">
  import UploadImagesScreen from '$lib/Screens/UploadImagesScreen.svelte';
  import type { ImageFile } from '$lib/ImageFile';
  import ConfigScreen from '$lib/Screens/ConfigScreen.svelte';
  import EditorScreen from '$lib/Screens/EditorScreen.svelte';
  import { AsyncImageResizer } from '$lib/ImageResizer/AsyncImageResizer';
  import { ProgressBarState } from '$lib/States/ProgressBarState.svelte';
  import type { ImagesSaver } from '$lib/ImageSaver/ImagesSaver';
  import { ZipArchiveWithStreamsaverImageSaver } from '$lib/ImageSaver/ZipArchiveWithStreamsaverImageSaver';
  import { CanvasChef } from '$lib/Chef/CanvasChef';
  import type { Chef } from '$lib/Chef/Chef';
  import { CarvingKnife } from '$lib/CarvingKnife/CarvingKnife';
  import { AlertsLevel, AlertsState } from '$lib/States/AlertsState.svelte';
  import { m } from '$lib/paraglide/messages.js';
  import { ZipArchiveWithFSImageSaver } from '$lib/ImageSaver/ZipArchiveWithFSImageSaver';
  import { Analytics } from '$lib/Analytics';
  import { ConfigDenoiser, ConfigDetector, type ConfigState } from '$lib/ConfigState';
  import { PixelComparisonDetector } from '$lib/Detectors/PixelComparisonDetector';
  import { UnjpegDenoiser } from '$lib/Denoiser/UnjpegDenoiser';
  import { browser } from '$app/environment';

  let images: ImageFile[] = $state([]);
  let config: ConfigState | null = $state(null);
  let cutsInit: number[] = $state([]);
  const progressBar = ProgressBarState.use();
  const alerts = AlertsState.use();
  const denoiser = new UnjpegDenoiser(
    (browser && localStorage.unjpegEndpoint) || 'https://denoiser.cropybara.app/',
  );
  let denoiserPromise: Promise<unknown> | null = $state(null);

  let widths = $derived(
    Object.entries(
      images.reduce(
        (acc, image) => {
          if (!(image.width in acc)) acc[image.width] = [];
          acc[image.width].push(image.name);
          return acc;
        },
        {} as Record<number, string[]>,
      ),
    )
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([k, v]) => [parseInt(k, 10), v] as [number, string[]]),
  );
  let height = $derived(images.reduce((acc, image) => acc + image.height, 0));

  function handleCancel() {
    images = [];
    cutsInit = [];
    config = null;
  }

  async function handleConfig(cfg: ConfigState) {
    const outliers = images.filter((image) => image.width !== widths[0][0]);

    if (outliers.length > 0) {
      const resizer = new AsyncImageResizer();
      const controller = new AbortController();

      const state = $state({ total: outliers.length, ready: 0 });
      const task = () => state;
      progressBar.add(task);

      try {
        await Promise.all(
          outliers.map(async (image) => {
            try {
              const index = images.indexOf(image);
              images[index] = await resizer.resize(image, widths[0][0], controller.signal);
            } finally {
              state.ready++;
            }
          }),
        );
      } finally {
        progressBar.remove(task);
      }
    }

    console.log(cfg);

    if (cfg.denoiser === ConfigDenoiser.Unjpeg) {
      const state = $state({ total: images.length, ready: 0 });
      const task = () => state;
      progressBar.add(task);
      denoiserPromise = Promise.all(
        images.map(async (image, index) => {
          try {
            images[index] = await denoiser.process(image);
          } catch (err) {
            alerts.display(AlertsLevel.Error, m.ConfigScreen_DenoiserError({ name: image.name }));
          } finally {
            state.ready++;
          }
        }),
      ).finally(() => {
        progressBar.remove(task);
        denoiserPromise = null;
      });
    }

    if (cfg.detector === ConfigDetector.PixelComparison) {
      const state = $state({ total: 1, ready: 0 });
      const task = () => state;
      progressBar.add(task);
      const start = Date.now();

      try {
        cutsInit = await PixelComparisonDetector.process(images, {
          margins: cfg.margins,
          maxDistance: cfg.limit,
          step: cfg.step,
          sensitivity: cfg.sensitivity / 100,
          maxSearchDeviationFactor: 0.5,
        });
      } catch (err) {
        console.error(`Failed to process images`, err);
      } finally {
        progressBar.remove(task);
      }
      console.log('Done!', 'Duration=', Date.now() - start, cutsInit);
    }

    config = cfg;
  }

  async function handleCuts(cuts: ReadonlyArray<number>) {
    if (!config) return;

    if (denoiserPromise) {
      alerts.display(AlertsLevel.Info, m.ConfigScreen_DenoiserInProgress());
      return;
    }

    const saver: ImagesSaver = ZipArchiveWithFSImageSaver.isSupported
      ? new ZipArchiveWithFSImageSaver()
      : new ZipArchiveWithStreamsaverImageSaver();

    /* (cuts + 1) + 1 for the zip file */
    let task = $state({ total: cuts.length + 1 + 1, ready: 0 });
    const getter = () => task;
    progressBar.add(getter);

    try {
      const chef: Chef = new CanvasChef();

      const controller = new AbortController();
      const slices = CarvingKnife.cut(images, cuts);

      performance.mark('slicingStart');

      await saver.save(config.name, chef.process(slices, controller.signal), () => {
        task.ready += 1;
        console.log('Progress:', task.ready, '/', task.total);
      });

      performance.mark('slicingFinish');
      const slicingMeasure = performance.measure(
        'slicingDuration',
        'slicingStart',
        'slicingFinish',
      );
      console.debug(slicingMeasure.duration);
      alerts.display(AlertsLevel.Success, m.Done());
      Analytics.trackScreen('ResultScreen');
    } finally {
      progressBar.remove(getter);
    }
  }
</script>

{#if images.length === 0}
  <UploadImagesScreen onImages={(i) => (images = i)} />
{:else if !config}
  <ConfigScreen {widths} {height} onCancel={handleCancel} onSubmit={handleConfig} />
{:else}
  <EditorScreen
    {images}
    {cutsInit}
    limit={config.limit}
    onCancel={handleCancel}
    onSubmit={handleCuts}
  />
{/if}
