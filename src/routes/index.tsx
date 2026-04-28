import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "NBR Audit Selection 2023-24 — TIN Checker" },
      {
        name: "description",
        content:
          "Instantly check if your TIN is among the 72,341 returns selected for NBR Risk-Based Audit (Assessment Year 2023-24).",
      },
      { property: "og:title", content: "NBR Audit Selection 2023-24 — TIN Checker" },
      {
        property: "og:description",
        content: "Instant offline TIN lookup against the official NBR audit selection list.",
      },
    ],
  }),
});

type AuditResult = {
  tin: string;
  zone: string;
  circle: string;
  submission_type: string;
  assessment_year: string;
};

type AuditDB = {
  zones: string[];
  circles: string[];
  data: Record<string, [number, number, string, string]>;
};

let dbPromise: Promise<AuditDB> | null = null;
function loadDB(): Promise<AuditDB> {
  if (!dbPromise) {
    dbPromise = fetch("/data/audit.json").then((r) => r.json());
  }
  return dbPromise;
}

function Index() {
  const [tin, setTin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "notfound">("idle");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const dbRef = useRef<AuditDB | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Warm-load the DB after first paint so first lookup is instant.
    setDbLoading(true);
    loadDB()
      .then((db) => {
        dbRef.current = db;
        setDbReady(true);
      })
      .finally(() => setDbLoading(false));
    inputRef.current?.focus();
  }, []);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const q = tin.trim();
    if (!q) return;
    setStatus("loading");
    setResult(null);
    const db = dbRef.current ?? (await loadDB());
    dbRef.current = db;
    const row = db.data[q];
    if (row) {
      setResult({
        tin: q,
        zone: db.zones[row[0]],
        circle: db.circles[row[1]],
        submission_type: row[2],
        assessment_year: row[3],
      });
      setStatus("found");
    } else {
      setStatus("notfound");
    }
  }

  const totalRecords = "72,341";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[image:var(--gradient-hero)] flex items-center justify-center text-primary-foreground font-bold text-lg shadow-[var(--shadow-elegant)]">
              N
            </div>
            <div>
              <div className="font-semibold leading-tight">NBR Audit Checker</div>
              <div className="text-xs text-muted-foreground tracking-wide uppercase">
                AY 2023–24 · Risk-Based
              </div>
            </div>
          </div>
          <a
            href="https://nbr.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            nbr.gov.bd ↗
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)] animate-pulse" />
            Official NBR data · {totalRecords} returns
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Is your TIN selected for{" "}
            <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
              NBR Audit?
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Instantly check the official Risk-Based Audit Selection list for Assessment Year
            2023–24. Runs entirely in your browser — no data leaves your device.
          </p>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-12">
          <form
            onSubmit={handleCheck}
            className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <label htmlFor="tin" className="block text-sm font-medium mb-2">
              Taxpayer Identification Number (TIN)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                ref={inputRef}
                id="tin"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 123456789012"
                value={tin}
                onChange={(e) => setTin(e.target.value.replace(/\D/g, ""))}
                className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-lg tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-ring transition"
                maxLength={20}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!tin.trim()}
                className="rounded-lg bg-[image:var(--gradient-hero)] px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Check Status
              </button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              {dbLoading && !dbReady && (
                <>
                  <span className="h-2 w-2 rounded-full bg-[color:var(--warning)] animate-pulse" />
                  Loading database…
                </>
              )}
              {dbReady && (
                <>
                  <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                  Database ready · lookups are instant
                </>
              )}
            </div>
          </form>

          <div className="mt-6">
            {status === "found" && result && (
              <div className="rounded-2xl border-2 border-[color:var(--warning)] bg-[color:var(--accent)] p-6 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-[color:var(--warning)] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    !
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-accent-foreground">
                      Selected for Audit
                    </h2>
                    <p className="text-sm text-accent-foreground/80 mt-1">
                      This TIN appears on the NBR Risk-Based Audit list.
                    </p>
                    <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <Field label="TIN" value={result.tin} mono />
                      <Field label="Assessment Year" value={result.assessment_year} />
                      <Field label="Zone" value={result.zone} />
                      <Field label="Circle" value={result.circle} />
                      <Field label="Submission Type" value={result.submission_type} />
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {status === "notfound" && (
              <div className="rounded-2xl border-2 border-[color:var(--success)] bg-card p-6 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-[color:var(--success)] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    ✓
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Not Selected</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      TIN <span className="font-mono">{tin}</span> is not in the NBR audit
                      selection list for AY 2023–24.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-3">
            <Stat value={totalRecords} label="Returns selected" />
            <Stat value="49" label="Tax zones" />
            <Stat value="100%" label="Client-side · private" />
          </div>

          <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">About this tool.</strong> The National Board of
            Revenue (NBR) selected 72,341 income tax returns for audit in the second phase using
            an automated Risk-Based Audit Criterion for tax year 2023–24. This site lets you
            search the published TIN list instantly. Source: NBR press release, 28 April 2026.
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-muted-foreground">
          <div>
            Built with <span className="text-[color:var(--warning)]">♥</span> and AI by{" "}
            <a
              href="https://github.com/asifrahman"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              M Asif Rahman
            </a>
          </div>
          <div className="mt-1 text-xs">
            © {new Date().getFullYear()} · Unofficial tool · Data sourced from NBR
          </div>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-card/70 border border-border/60 p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-medium ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <div className="text-2xl font-bold bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
