import { createServerFn } from "@tanstack/react-start";

export type UmamiCounts = {
  visitors: number;
  tinChecks: number;
  error: string | null;
};

export const getUmamiCounts = createServerFn({ method: "GET" }).handler(
  async (): Promise<UmamiCounts> => {
    const host = process.env.UMAMI_HOST;
    const websiteId = process.env.UMAMI_WEBSITE_ID;
    const apiKey = process.env.UMAMI_API_KEY;

    if (!host || !websiteId || !apiKey) {
      return { visitors: 0, tinChecks: 0, error: "Umami not configured" };
    }

    // Wide window: from 2024-01-01 → now. Umami counts cumulatively in window.
    const startAt = new Date("2024-01-01T00:00:00Z").getTime();
    const endAt = Date.now();
    const base = host.replace(/\/$/, "");
    const headers = {
      "x-umami-api-key": apiKey,
      Accept: "application/json",
    };

    try {
      const statsUrl = `${base}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`;
      const eventsUrl = `${base}/api/websites/${websiteId}/events/series?startAt=${startAt}&endAt=${endAt}&unit=year&timezone=UTC`;

      const [statsRes, eventsRes] = await Promise.all([
        fetch(statsUrl, { headers }),
        fetch(eventsUrl, { headers }),
      ]);

      let visitors = 0;
      if (statsRes.ok) {
        const s = (await statsRes.json()) as {
          visitors?: { value?: number };
        };
        visitors = s.visitors?.value ?? 0;
      } else {
        console.error("Umami stats error", statsRes.status);
      }

      let tinChecks = 0;
      if (eventsRes.ok) {
        const series = (await eventsRes.json()) as Array<{
          x: string;
          y: number;
        }>;
        const tinSeries = series.find((row) => row.x === "tin_lookup");
        tinChecks = tinSeries?.y ?? 0;
      } else {
        // Fallback: try the events list endpoint shape
        console.error("Umami events error", eventsRes.status);
      }

      return { visitors, tinChecks, error: null };
    } catch (err) {
      console.error("Umami fetch failed", err);
      return { visitors: 0, tinChecks: 0, error: "Umami unavailable" };
    }
  },
);