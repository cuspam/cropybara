<script lang="ts">
  import * as env from '$env/static/public';
  import { onMount } from 'svelte';

  const id = !(
    'PUBLIC_GA_MEASUREMENT_ID' in env && typeof env.PUBLIC_GA_MEASUREMENT_ID === 'string'
  )
    ? null
    : env.PUBLIC_GA_MEASUREMENT_ID;

  onMount(() => {
    if (!id) return;
    try {
      gtag('js', new Date());
      gtag('config', id, { send_page_view: false });
    } catch {
      console.warn('Failed to initialize Google Analytics');
    }
  });
</script>

<svelte:head>
  {#if id}
    <script async src="https://www.googletagmanager.com/gtag/js?id={id}">
    </script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
    </script>
  {/if}
</svelte:head>
