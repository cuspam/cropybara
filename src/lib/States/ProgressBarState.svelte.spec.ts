import { beforeEach, describe, expect, it } from 'vitest';
import { ProgressBarState } from './ProgressBarState.svelte';

describe('ProgressBarState', () => {
  let state: ProgressBarState;

  beforeEach(() => {
    state = new ProgressBarState();
  });

  it('should not display progress bar when there are no tasks', () => {
    expect(state.display).toBeFalsy();
  });

  it('should display progress bar when a task is added', () => {
    state.add(() => ({ total: 10, ready: 1 }));
    expect(state.display).toBeTruthy();
  });

  it('should not display progress bar after removing all tasks', () => {
    const getter = () => ({ total: 10, ready: 1 });
    state.add(getter);
    state.remove(getter);
    expect(state.display).toBeFalsy();
  });

  it('should calculate average progress of multiple tasks', () => {
    state.add(() => ({ total: 10, ready: 3 }));
    state.add(() => ({ total: 10, ready: 1 }));
    expect(state.progress).toBe(0.2);
  });

  it('should handle tasks with total: 0 gracefully', () => {
    state.add(() => ({ total: 10, ready: 5 }));
    state.add(() => ({ total: 0, ready: 0 }));
    state.add(() => ({ total: 0, ready: 5 }));

    expect(state.progress).toBe(0.5);
  });

  it('should handle tasks where ready > total', () => {
    state.add(() => ({ total: 10, ready: 5 })); // 0.5
    state.add(() => ({ total: 5, ready: 6 })); // 1.2

    expect(state.progress).toBeCloseTo(0.75);
  });

  it('should not change state when removing a non-existent task', () => {
    const getter = () => ({ total: 10, ready: 1 });
    const getterNotInList = () => ({ total: 5, ready: 1 });

    state.add(getter);
    expect(state.display).toBeTruthy();

    state.remove(getterNotInList); // Try removing a different task
    expect(state.display).toBeTruthy(); // Should still be true

    state.remove(getter); // Remove the actual task
    expect(state.display).toBeFalsy();

    state.remove(getter); // Try removing again
    expect(state.display).toBeFalsy();
  });

  it('should calculate average progress of multiple tasks', () => {
    const task1 = () => ({ total: 10, ready: 1 });
    const task2 = () => ({ total: 10, ready: 3 });

    state.add(task1);
    state.add(task1);
    state.add(task2);
    expect(state.progress).toBe(0.2);
  });
});
