<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = {
    position: number;
    prev: number;
    next: number;
  } & HTMLAttributes<HTMLDivElement>;
  const { position, prev, next, ...rest }: Props = $props();
</script>

<div class="cut" style="transform: translateY(calc({position}px - 2rem))" {...rest}>
  <div class="filler"></div>
</div>

<div class="info" style="transform: translateY(calc({position}px - 1.5rem))">
  {prev}
</div>

<div class="info" style="transform: translateY(calc({position}px + 0.5rem))">
  {next}
</div>

<style lang="scss">
  .cut {
    position: absolute;
    left: 0;
    top: 0;
    padding: 2rem 0;
    width: 100%;
    cursor: row-resize;
    transform: translateY(-1rem);
    z-index: 100;
    /* default browser behaviors should be disabled for this element */
    touch-action: none;

    &:focus {
      outline: none;
    }
  }

  .info {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    color: white;
    text-align: right;
    text-shadow:
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000;
    padding-right: 1rem;
    box-sizing: border-box;
  }

  .filler {
    display: block;
    width: 100%;
    height: 1px;
    background-color: #00ffff;
  }

  .cut:focus .filler {
    background-color: #00ff95;
  }

  .cut:hover .filler {
    background-color: #ff00ff;
  }
</style>
