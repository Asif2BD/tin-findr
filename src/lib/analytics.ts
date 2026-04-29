declare global {
  interface Window {
    umami?: {
      track: (
        eventName: string,
        params?: Record<string, string | number | boolean>,
      ) => void;
    };
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  try {
    if (typeof window !== "undefined" && window.umami) {
      window.umami.track(eventName, params);
    }
  } catch {
    // swallow analytics errors
  }
}

// Helpers for key app events
export const analytics = {
  tinLookup: (tin: string) =>
    trackEvent("tin_lookup", { tin_length: tin.length }),
  tinFound: (zone: string, year: string) =>
    trackEvent("tin_found", { zone, year }),
  tinNotFound: () => trackEvent("tin_not_found"),
  sourceViewed: () => trackEvent("source_document_viewed"),
  sourceDownloaded: () => trackEvent("source_document_downloaded"),
  externalLink: (url: string) => trackEvent("external_link_click", { url }),
  error: (where: string, message: string) =>
    trackEvent("error", { where, message: message.slice(0, 200) }),
};
