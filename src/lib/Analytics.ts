import { browser } from '$app/environment';

export class Analytics {
  protected static googleAnalyticsId: string | undefined;

  public static initGoogleAnalytics(id: string) {
    this.googleAnalyticsId = id;
    this.googleAnalytics('js', new Date());
    this.googleAnalytics('config', id);
  }

  protected static googleAnalytics<Command extends keyof Gtag.GtagCommands>(
    ...args: [Command, ...Gtag.GtagCommands[Command]]
  ) {
    if (!browser) return;
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(args);
  }
}
