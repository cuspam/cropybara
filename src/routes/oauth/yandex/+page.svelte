<script lang="ts">
  import { onMount } from 'svelte';
  import type { YandexOAuthToken } from '$lib/YandexOAuthToken';
  import { LocalStorageStore } from '$lib/LocalStorageStore.svelte';
  import { AlertsLevel, AlertsState } from '$lib/States/AlertsState.svelte';
  let newToken: { access_token: string; expires_in: number } | null = $state(null);
  let token = new LocalStorageStore<YandexOAuthToken>('oauth:yandex', {
    access_token: '',
    token_type: '',
    expires_at: 0,
  });
  let error: boolean = $state(false);
  const alerts = AlertsState.use();

  onMount(() => {
    newToken = Object.fromEntries(
      location.hash
        .slice(1)
        .split('&')
        .map((x) => x.split('=', 2).map(decodeURIComponent)),
    );
  });

  $effect(() => {
    if (!newToken) return;
    const abortController = new AbortController();

    (async () => {
      // Validation of token
      const response = await fetch('https://cloud-api.yandex.net/v1/disk/', {
        headers: {
          Authorization: `OAuth ${newToken.access_token}`,
        },
        signal: abortController.signal,
      });

      if (response.ok) {
        token.value = {
          access_token: newToken.access_token,
          token_type: `OAuth`,
          expires_at: Date.now() + newToken.expires_in * 1000 - 10_000,
        };
        alerts.display(AlertsLevel.Success, 'Successfully logged in');
        location.href = '/?source=oauth-yandex';
      } else {
        alerts.display(AlertsLevel.Error, 'Failed to perform oauth login');
      }
    })();

    return () => abortController.abort();
  });
</script>

<main>
  <h1>Yandex OAuth</h1>
  {#if !error}
    <p>Еще секунду и вы вернетесь в приложение...</p>
  {:else}
    <p>
      Не удалось авторизоваться в сервисах Яндекса. Вернитесь <a href="/">назад</a> и попробуйте снова.
    </p>
  {/if}
</main>

<style lang="scss">
  main {
    text-align: center;
  }
</style>
