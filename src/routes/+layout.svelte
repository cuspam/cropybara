<script>
  import '../style/app.scss';
  import ProgressBar from '$lib/Components/ProgressBar.svelte';
  import Alerts from '$lib/Components/Alerts.svelte';
  import Analytics from '$lib/Components/Analytics.svelte';
</script>

<Analytics />
<ProgressBar />
<Alerts />
<slot />
