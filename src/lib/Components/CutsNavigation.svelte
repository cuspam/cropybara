<script lang="ts">
  const {
    onNextClick,
    onPrevClick,
    current,
    total,
  }: {
    onPrevClick: () => void;
    onNextClick: () => void;
    current: number;
    total: number;
  } = $props();
</script>

<section>
  <button class="prev" aria-label="Prev" onclick={onPrevClick}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      class="bi bi-chevron-left"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
      />
    </svg>
  </button>

  <div class="position">
    {current}&nbsp;/&nbsp;{total}
  </div>

  <button class="next" aria-label="Next" onclick={onNextClick}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      class="bi bi-chevron-right"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
      />
    </svg>
  </button>
</section>

<style>
  section {
    position: fixed;
    align-items: center;
    justify-content: center;
    left: 50%;
    transform: translateX(-50%);
    bottom: 3rem;
    display: flex;
    z-index: 1000;
    color: white;
    border-radius: 0.5rem;
    flex-wrap: nowrap;
    user-select: none;
    background: rgba(0, 0, 0, 0.5);

    button:first-child {
      border-top-left-radius: var(--input-border-radius);
      border-bottom-left-radius: var(--input-border-radius);
      border-right: none;
    }

    button:last-child {
      border-top-right-radius: var(--input-border-radius);
      border-bottom-right-radius: var(--input-border-radius);
      border-left: none;
    }
  }

  svg {
    width: 1em;
    height: 1em;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: transparent;
    color: white;
    border: 2px solid var(--color-accent);
  }

  button:hover,
  button:focus {
    background: var(--color-accent);
    outline: none;
  }
  button:active {
    color: black;
  }

  .position {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1em;
    height: 2.5rem;
    border: 2px solid var(--color-accent);
    border-left: 0;
    border-right: 0;
    box-sizing: border-box;
  }
</style>
