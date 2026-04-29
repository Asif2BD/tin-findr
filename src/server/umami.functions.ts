import { createServerFn } from "@tanstack/react-start";

export type UmamiCounts = {
  visitors: number;
  tinChecks: number;
  error: string | null;
};

// In-memory token cache (per Worker instance). Re-login on 401 or expiry.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(host: string): Promise<string | null> {
  const username = process.env.UMAMI_USERNAME;
  const password = process.env.UMAMI_PASSWORD;
  if (!username || !password) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const res = await fetch(`${host}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    console.error("Umami login failed", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { token: string };
  // Cache for 6 hours (JWT typically lasts longer; refresh proactively)
  cachedToken = { token: data.token, expiresAt: Date.now() + 6 * 60 * 60 * 1000 };
  return data.token;
}

export const getUmamiCounts = createServerFn({ method: "GET" }).handler(
  async (): Promise<UmamiCounts> => {
    const rawHost = process.env.UMAMI_HOST;
    const websiteId = process.env.UMAMI_WEBSITE_ID;

    if (!rawHost || !websiteId) {
      return { visitors: 0, tinChecks: 0, error: "Umami not configured" };
    }

    const host = rawHost.replace(/\/$/, "");
    const startAt = new Date("2024-01-01T00:00:00Z").getTime();
    const endAt = Date.now();

    try {
      let token = await getToken(host);
      if (!token) {
        return { visitors: 0, tinChecks: 0, error: "Umami auth failed" };
      }

      const fetchWithRetry = async (url: string): Promise<Response> => {
        const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
        let res = await fetch(url, { headers });
        if (res.status === 401) {
          // Token expired — clear cache and retry once
          cachedToken = null;
          token = await getToken(host);
          if (!token) return res;
          res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          });
        }
        return res;
      };

      const statsUrl = `${host}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`;
      const eventsUrl = `${host}/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=event`;

      const [statsRes, eventsRes] = await Promise.all([
        fetchWithRetry(statsUrl),
        fetchWithRetry(eventsUrl),
      ]);

      let visitors = 0;
      if (statsRes.ok) {
        const s = (await statsRes.json()) as { visitors?: number };
        visitors = typeof s.visitors === "number" ? s.visitors : 0;
      } else {
        console.error("Umami stats error", statsRes.status, await statsRes.text());
      }

      let tinChecks = 0;
      if (eventsRes.ok) {
        const metrics = (await eventsRes.json()) as Array<{ x: string; y: number }>;
        const tinRow = metrics.find((m) => m.x === "tin_lookup");
        tinChecks = tinRow?.y ?? 0;
      } else {
        console.error("Umami events error", eventsRes.status, await eventsRes.text());
      }

      return { visitors, tinChecks, error: null };
    } catch (err) {
      console.error("Umami fetch failed", err);
      return { visitors: 0, tinChecks: 0, error: "Umami unavailable" };
    }
  },
);
