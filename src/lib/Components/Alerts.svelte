<script lang="ts">
  import { flip } from 'svelte/animate';
  import { AlertsState } from '$lib/States/AlertsState.svelte';

  const state = AlertsState.use();

  function closeWithKeyboard(id: number) {
    return (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        state.remove(id);
      }
    };
  }
</script>

<section>
  {#each state.alerts as alert (alert.id)}
    <div
      class="alert {alert.level}"
      onclick={() => state.remove(alert.id)}
      onkeydown={closeWithKeyboard(alert.id)}
      animate:flip
      role="button"
      tabindex="0"
    >
      {alert.message}
    </div>
  {/each}
</section>

<style>
  section {
    position: fixed;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 100%;
    max-width: 360px;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .alert {
    max-width: 500px;
    margin: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
  }

  .alert.error {
    background: rgba(248, 215, 218, 1);
    color: black;
  }

  .alert.warning {
    background: rgba(255, 243, 205, 1);
    color: black;
  }

  .alert.info {
    background: rgba(207, 244, 252, 1);
    color: black;
  }

  .alert.success {
    background: rgba(209, 231, 221, 1);
    color: black;
  }
</style>
