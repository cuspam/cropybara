<script lang="ts">
  import { PUBLIC_GA_MEASUREMENT_ID } from '$env/static/public';
  import { onMount } from 'svelte';

  onMount(() => {
    if (!PUBLIC_GA_MEASUREMENT_ID) return;
    try {
      gtag('js', new Date());
      gtag('config', PUBLIC_GA_MEASUREMENT_ID, { send_page_view: false });
    } catch {
      console.warn('Failed to initialize Google Analytics');
    }
  });
</script>

<svelte:head>
  {#if PUBLIC_GA_MEASUREMENT_ID}
    <script async src="https://www.googletagmanager.com/gtag/js?id={PUBLIC_GA_MEASUREMENT_ID}">
    </script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
    </script>
  {/if}
</svelte:head>
