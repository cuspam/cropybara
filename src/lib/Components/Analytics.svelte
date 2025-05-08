<script lang="ts">
  import { PUBLIC_GA_MEASUREMENT_ID } from '$env/static/public';
  import { onMount } from 'svelte';
  import { Analytics } from '$lib/Analytics';

  onMount(() => {
    if (!PUBLIC_GA_MEASUREMENT_ID) return;
    Analytics.initGoogleAnalytics(PUBLIC_GA_MEASUREMENT_ID);
  });
</script>

<svelte:head>
  {#if PUBLIC_GA_MEASUREMENT_ID}
    <script async src="https://www.googletagmanager.com/gtag/js?id={PUBLIC_GA_MEASUREMENT_ID}">
    </script>
  {/if}
</svelte:head>
