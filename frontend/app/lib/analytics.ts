// Lightweight, privacy-first analytics helper

export type AnalyticsEvent =
  | { name: "calculate_recommendations"; properties: { monthlySpend: number; topCategory: string; annualIncome: number; resultCount: number } }
  | { name: "click_apply_link"; properties: { cardName: string; bankName: string; url: string } }
  | { name: "click_preset"; properties: { presetName: string } }
  | { name: "share_click"; properties: { platform: string } }
  | { name: "faq_toggle"; properties: { question: string; isOpen: boolean } };

export function trackEvent(event: AnalyticsEvent) {
  // In development or when no provider is configured, log cleanly in debug mode
  if (typeof window !== "undefined") {
    // If user has a custom analytics script like Plausible or Google Analytics
    if (typeof (window as unknown as { plausible?: (name: string, options?: unknown) => void }).plausible === "function") {
      (window as unknown as { plausible: (name: string, options?: unknown) => void }).plausible(event.name, {
        props: event.properties,
      });
    } else if (typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === "function") {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", event.name, event.properties);
    }
  }
}
