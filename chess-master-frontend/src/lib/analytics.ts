export const GA_MEASUREMENT_ID = "G-NCQC7PT2L5";
export const CONSENT_STORAGE_KEY = "cwm_analytics_consent";
export const OPEN_CONSENT_EVENT = "cwm-open-consent";

export type AnalyticsConsent = "granted" | "denied";

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (value === "granted" || value === "denied") return value;
  } catch {
    return null;
  }
  return null;
}

export function applyAnalyticsConsent(choice: AnalyticsConsent): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage can be blocked; the in-page choice still updates Consent Mode.
  }
  window.gtag?.("consent", "update", {
    analytics_storage: choice,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function openConsentSettings(): void {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const recentKeys = new Map<string, number>();

function shouldSend(key: string, windowMs = 1000): boolean {
  const now = Date.now();
  const last = recentKeys.get(key);
  if (last != null && now - last < windowMs) return false;
  recentKeys.set(key, now);
  return true;
}

function cleanParams(params: EventParams): Record<string, string | number | boolean> {
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) cleaned[key] = value;
  }
  return cleaned;
}

export function trackEvent(
  name: string,
  params: EventParams = {},
  options?: { force?: boolean }
): void {
  if (typeof window === "undefined") return;
  const payload = cleanParams(params);
  const dedupeKey = `${name}:${JSON.stringify(payload)}`;
  if (!options?.force && !shouldSend(dedupeKey)) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });

  if (typeof window.gtag === "function") {
    window.gtag("event", name, {
      ...payload,
      send_to: GA_MEASUREMENT_ID,
    });
  }
}

function contentGroup(path: string): string | undefined {
  const pathname = path.split("?")[0];
  if (pathname === "/posts") return "blog_list";
  if (pathname.startsWith("/posts/")) return "blog_post";
  return undefined;
}

export function trackPageView(
  path: string,
  title?: string,
  options?: { force?: boolean }
): void {
  const group = contentGroup(path);
  trackEvent(
    "page_view",
    {
      page_path: path,
      page_title: title || (typeof document !== "undefined" ? document.title : undefined),
      page_location: typeof window !== "undefined" ? window.location.href : undefined,
      content_group: group,
    },
    options
  );
}
