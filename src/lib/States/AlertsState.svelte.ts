export class AlertsState {
  private static instance: AlertsState | null = null;
  #alerts: Array<AlertsItem> = $state([]);
  protected id = 0;

  public static use() {
    if (!this.instance) {
      this.instance = new AlertsState();
    }

    return this.instance;
  }

  public get alerts(): ReadonlyArray<AlertsItem> {
    return this.#alerts;
  }

  public display(level: AlertsLevel, message: string, duration = 5000) {
    const item: AlertsItem = {
      id: this.id++,
      level,
      message,
    };
    this.#alerts.push(item);
    setTimeout(() => this.remove(item.id), duration);
  }

  public remove(id: number) {
    this.#alerts = this.alerts.filter((i) => i.id !== id);
  }
}

export interface AlertsItem {
  id: number;
  level: AlertsLevel;
  message: string;
}

export enum AlertsLevel {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Success = 'success',
}
