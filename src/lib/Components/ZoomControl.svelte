<script lang="ts">
  type Props = {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
  };

  const { zoom, onZoomIn, onZoomOut, onReset }: Props = $props();
</script>

<section>
  <button class="prev" aria-label="Zoom out" onclick={onZoomOut}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-zoom-out"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0"
      />
      <path
        d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1 6.5 6.5 0 0 1-1.398 1.4z"
      />
      <path fill-rule="evenodd" d="M3 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5" />
    </svg>
  </button>

  <div onclick={onReset}>{zoom < 0.1 ? (zoom * 100).toFixed(1) : (zoom * 100).toFixed(0)}%</div>

  <button class="next" aria-label="Zoom in" onclick={onZoomIn}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-zoom-in"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0"
      />
      <path
        d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1 6.5 6.5 0 0 1-1.398 1.4z"
      />
      <path
        fill-rule="evenodd"
        d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5"
      />
    </svg>
  </button>
</section>

<style lang="scss">
  @use '../../style/mixins.scss';

  section {
    top: var(--editor-top-offset);
    @include mixins.editor-control;
  }
</style>
