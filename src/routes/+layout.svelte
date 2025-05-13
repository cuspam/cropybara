<script>
  import '../style/app.scss';
  import ProgressBar from '$lib/Components/ProgressBar.svelte';
  import Alerts from '$lib/Components/Alerts.svelte';
  import Analytics from '$lib/Components/Analytics.svelte';
  import posthog from 'posthog-js';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import * as env from '$env/static/public';

  onMount(() => {
    if (browser && 'PUBLIC_POSTHOG_KEY' in env && typeof env['PUBLIC_POSTHOG_KEY'] === 'string') {
      posthog.init(env['PUBLIC_POSTHOG_KEY'], {
        api_host: 'https://eu.i.posthog.com',
        person_profiles: 'always',
      });
    }
  });
</script>

<Analytics />
<ProgressBar />
<Alerts />
<slot />
