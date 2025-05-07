import { CutsState } from '$lib/States/CutsState.svelte';

export class CutsEditorState {
  #cuts: CutsState;
  #activeCutIndex = $state(-1);
  #cutStartPosition = $state(0);
  #pointerStartPosition = $state(0);

  public get cuts(): ReadonlyArray<number> {
    return this.#cuts.cuts;
  }

  public constructor(cuts: CutsState) {
    this.#cuts = cuts;
  }

  public startMove(index: number, y: number) {
    this.#activeCutIndex = index;
    this.#cutStartPosition = this.cuts[index];
    this.#pointerStartPosition = y;
  }

  public finishMove() {
    this.#activeCutIndex = -1;
    this.#cutStartPosition = this.#pointerStartPosition = 0;
    this.#cuts.cleanup();
  }

  public performMove(y: number, zoom: number) {
    if (this.#activeCutIndex < 0) return;

    // Total cursor displacement from the starting point
    const displacement = y - this.#pointerStartPosition;
    // New position = Initial value + Scaled displacement
    this.#cuts.move(this.#activeCutIndex, this.#cutStartPosition + displacement / zoom);
  }
}
