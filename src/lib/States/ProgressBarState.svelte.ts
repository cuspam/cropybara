/**
 * Aggregates the progress of multiple concurrent tasks for display in a UI element like a progress bar.
 */
export class ProgressBarState {
  private static instance: ProgressBarState | null = null;

  /**
   * Gets the singleton instance of the ProgressBarState.
   * Creates the instance if it doesn't exist yet.
   */
  public static use(): ProgressBarState {
    if (!this.instance) {
      this.instance = new ProgressBarState();
    }

    return this.instance;
  }

  /** The list of active task getter functions */
  #tasks: Array<TaskEntry> = $state([]);

  /**
   * Reactive property indicating whether the progress bar should be displayed.
   * True if there is at least one task, false otherwise.
   */
  public readonly display = $derived(this.#tasks.length > 0);

  /**
   * Reactive property representing the overall progress as a number between 0 and 1.
   * Calculates the average progress of all *valid* tasks (those with `total > 0`).
   * The progress of each task is capped at 1.
   * Returns 0 if there are no valid tasks.
   */
  public readonly progress = $derived.by(() => {
    // Filter for tasks with a positive total count
    const validTasks = this.#tasks.filter((entry) => {
      // Get task details even if marked for removal
      const { total } = entry.task();
      return total > 0;
    });

    if (validTasks.length === 0) {
      return 1; // No valid tasks, progress is 1
    }

    // Calculate the sum of individual progresses, capped at 1
    const totalProgressSum = validTasks.reduce((acc, entry) => {
      const { total, ready } = entry.task();
      // Calculate individual progress, ensure it's not more than 1
      const individualProgress = Math.min(1, ready / total);
      // Ensure progress is not negative if ready is negative for some reason
      return acc + Math.max(0, individualProgress);
    }, 0);

    // Calculate the average based on the number of valid tasks
    return totalProgressSum / validTasks.length;
  });

  /**
   * Adds a task getter function to the progress calculation.
   * Does nothing if the exact same function reference is already present.
   */
  public add(task: () => ProgressBarStateItem) {
    // Avoid adding the exact same function reference multiple times
    if (this.#tasks.some((entry) => entry.task === task)) return;
    // Add the task, initially not marked for removal
    this.#tasks.push({ task, markedForRemoval: false });
  }

  /**
   * Marks a task getter function for removal.
   * If all tasks are marked for removal after this operation, the task list is cleared.
   */
  public remove(task: () => ProgressBarStateItem) {
    const taskIndex = this.#tasks.findIndex((entry) => entry.task === task);

    if (taskIndex === -1) {
      return; // Task not found
    }

    // Mark the task for removal
    this.#tasks[taskIndex] = { ...this.#tasks[taskIndex], markedForRemoval: true };

    // Check if all tasks are now marked for removal
    const allMarked = this.#tasks.every((entry) => entry.markedForRemoval);

    if (allMarked) {
      // If all tasks are marked, clear the list
      this.#tasks = [];
    }
  }
}

/**
 * Defines the structure for the state of an individual task contributing to the progress bar.
 */
export interface ProgressBarStateItem {
  /** The total number of items or steps for the task. Should be positive for progress calculation. */
  total: number;
  /** The number of items or steps completed so far. */
  ready: number;
}

/** Internal task representation */
interface TaskEntry {
  task: () => ProgressBarStateItem;
  markedForRemoval: boolean;
}
