<script>
  import '../style/app.scss';
  import ProgressBar from '$lib/Components/ProgressBar.svelte';
  import Alerts from '$lib/Components/Alerts.svelte';
</script>

<ProgressBar />
<Alerts />
<slot />
