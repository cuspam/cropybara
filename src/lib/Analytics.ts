import { browser } from '$app/environment';

export class Analytics {
  protected static googleAnalyticsId: string | undefined;

  public static trackScreen(name: string) {
    this.googleAnalytics('event', 'page_view', {
      page_title: name,
      page_path: `/${name}`,
      screen_name: name,
    });
  }

  protected static googleAnalytics<Command extends keyof Gtag.GtagCommands>(
    ...args: [Command, ...Gtag.GtagCommands[Command]]
  ) {
    if (!browser) return;
    try {
      gtag(...args);
    } catch {
      // ignored
    }
  }
}
