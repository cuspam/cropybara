<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    // Redirect for old clients
    window.location.href = 'https://cropybara.app/';
  });
</script>
