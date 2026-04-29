import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import nbrPressRelease from "@/assets/nbr-press-release.jpeg";
import { analytics } from "@/lib/analytics";
import { getUmamiCounts } from "@/server/umami.functions";
import { LanguageToggle, useI18n } from "@/i18n";
import { FooterGitHubLink } from "@/components/OpenSourceCard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "NBR Audit Selection 2023-24 — TIN Checker" },
      {
        name: "description",
        content:
          "Instantly check if your TIN is among the 87,685 returns selected for NBR Risk-Based Audit (Assessment Year 2023-24).",
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
  source: 0 | 1 | 2;
};

type AuditDB = {
  zones: string[];
  circles: string[];
  data: Record<string, [number, number, string, string, number?]>;
};

let dbPromise: Promise<AuditDB> | null = null;
function loadDB(): Promise<AuditDB> {
  if (!dbPromise) {
    dbPromise = fetch("/data/audit.json").then((r) => r.json());
  }
  return dbPromise;
}

function Index() {
  const { t, n, lang } = useI18n();
  const [tin, setTin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "notfound">("idle");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const dbRef = useRef<AuditDB | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [counts, setCounts] = useState<{ visitors: number; tinChecks: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    getUmamiCounts()
      .then((c) => {
        if (!cancelled && !c.error) {
          setCounts({ visitors: c.visitors, tinChecks: c.tinChecks });
        }
      })
      .catch(() => {
        // silently ignore — counter is non-critical
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const q = tin.trim();
    if (!q) return;
    if (q.length !== 12) {
      setValidationError(t("form.validation.length", { n: q.length }));
      setStatus("idle");
      setResult(null);
      return;
    }
    setValidationError(null);
    setStatus("loading");
    setResult(null);
    analytics.tinLookup(q);
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
        source: ((row[4] ?? 0) as 0 | 1 | 2),
      });
      setStatus("found");
      analytics.tinFound(db.zones[row[0]], row[3]);
    } else {
      setStatus("notfound");
      analytics.tinNotFound();
    }
  }

  const totalRecords = "87,685";
  const totalRecordsNum = 87685;

  const maskTin = (t: string): string => {
    if (t.length <= 4) return t;
    const first = t.slice(0, 2);
    const last = t.slice(-2);
    const middle = "•".repeat(Math.max(t.length - 4, 4));
    return `${first}${middle}${last}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-[image:var(--gradient-hero)] flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg shadow-[var(--shadow-elegant)] flex-shrink-0">
              N
            </div>
            <div className="min-w-0">
              <div className="font-semibold leading-tight text-sm sm:text-base truncate">{t("header.brand")}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground tracking-wide uppercase truncate">
                {t("header.tagline")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <LanguageToggle />
            <a
              href="https://nbr.gov.bd"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.externalLink("https://nbr.gov.bd")}
              className="hidden sm:inline text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              nbr.gov.bd ↗
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-8 sm:pt-12 pb-6 sm:pb-8 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] sm:text-xs text-muted-foreground mb-4 sm:mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)] animate-pulse" />
            {t("hero.badge.official")} · {n(totalRecordsNum)} {t("hero.badge.returns")}
            {counts && (counts.visitors > 0 || counts.tinChecks > 0) && (
              <>
                {counts.visitors > 0 && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>
                      <span className="font-medium text-foreground">
                        {n(counts.visitors)}
                      </span>{" "}
                      {t("hero.badge.visits")}
                    </span>
                  </>
                )}
                {counts.tinChecks > 0 && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>
                      <span className="font-medium text-foreground">
                        {n(counts.tinChecks)}
                      </span>{" "}
                      {t("hero.badge.tinChecks")}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            {t("hero.title.a")}{" "}
            <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
              {t("hero.title.b")}
            </span>
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
            {t("hero.subtitle")}
          </p>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-10 sm:pb-12">
          <form
            onSubmit={handleCheck}
            className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-[var(--shadow-card)]"
          >
            <label htmlFor="tin" className="block text-sm font-medium mb-2">
              {t("form.label")}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                ref={inputRef}
                id="tin"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={t("form.placeholder")}
                value={tin}
                onChange={(e) => {
                  setTin(e.target.value.replace(/\D/g, "").slice(0, 12));
                  if (validationError) setValidationError(null);
                }}
                className="flex-1 w-full min-w-0 rounded-lg border border-input bg-background px-4 py-3 text-base sm:text-lg tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-ring transition"
                maxLength={12}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!tin.trim() || tin.length !== 12}
                className="rounded-lg bg-[image:var(--gradient-hero)] px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
              >
                {t("form.button")}
              </button>
            </div>
            {validationError && (
              <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {validationError}
              </div>
            )}
            {!validationError && tin.length > 0 && tin.length < 12 && (
              <div className="mt-3 text-xs text-muted-foreground">
                {t("form.hint.remaining", { n: 12 - tin.length })}
              </div>
            )}
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              {dbLoading && !dbReady && (
                <>
                  <span className="h-2 w-2 rounded-full bg-[color:var(--warning)] animate-pulse" />
                  {t("form.db.loading")}
                </>
              )}
              {dbReady && (
                <>
                  <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                  {t("form.db.ready")}
                </>
              )}
            </div>
          </form>

          <div className="mt-6">
          <div className="mb-4 rounded-xl border border-border bg-muted/40 p-3 sm:p-4 text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">{t("disclaimer.title")}</strong>{" "}
            {t("disclaimer.body")}{" "}
            <strong className="text-foreground">{t("disclaimer.cta")}</strong>{" "}
            {t("disclaimer.tail")}
          </div>
            {status === "found" && result && (
              <div className="rounded-2xl border-2 border-[color:var(--warning)] bg-[color:var(--accent)] p-4 sm:p-6 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[color:var(--warning)] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    !
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-accent-foreground">
                      {t("result.found.title")}
                    </h2>
                    <p className="text-sm text-accent-foreground/80 mt-1">
                      {t("result.found.body")}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-2.5 py-1 text-[11px] font-medium text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--warning)]" />
                      {result.source === 2
                        ? t("result.found.source.both")
                        : result.source === 1
                          ? t("result.found.source.list2")
                          : t("result.found.source.list1")}
                    </div>
                    <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <Field label={t("result.field.tin")} value={maskTin(result.tin)} mono />
                      <Field label={t("result.field.year")} value={result.assessment_year} />
                      <Field label={t("result.field.zone")} value={result.zone} />
                      <Field label={t("result.field.circle")} value={result.circle} />
                      <Field label={t("result.field.submission")} value={result.submission_type} />
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {status === "notfound" && (
              <div className="rounded-2xl border-2 border-[color:var(--success)] bg-card p-4 sm:p-6 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[color:var(--success)] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold">{t("result.notfound.title")}</h2>
                    <p className="text-sm text-muted-foreground mt-1 break-all">
                      {t("result.notfound.body", { tin: maskTin(tin) })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-2 sm:gap-3">
            <Stat value={n(totalRecordsNum)} label={t("stat.returns")} />
            <Stat value={n(2)} label={t("stat.lists")} />
            <Stat value={lang === "bn" ? "১০০%" : "100%"} label={t("stat.client")} />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 text-sm text-muted-foreground leading-relaxed flex flex-col gap-3">
              <div>
                <strong className="text-foreground">{t("how.cta.title")}</strong>{" "}
                {t("how.cta.body")}
              </div>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition self-start"
              >
                {t("how.cta.link")}
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 text-sm text-muted-foreground leading-relaxed flex flex-col gap-3">
              <div>
                <strong className="text-foreground">{t("faq.cta.title")}</strong>{" "}
                {t("faq.cta.body")}
              </div>
              <Link
                to="/faq"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition self-start"
              >
                {t("faq.cta.link")}
              </Link>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 rounded-xl border border-border bg-card p-4 sm:p-5 text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">{t("about.title")}</strong>{" "}
            {t("about.body.a")}{" "}
            <strong className="text-foreground">{t("about.body.b")}</strong>{" "}
            {t("about.body.c")} {n(totalRecordsNum)} {t("about.body.d")}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSource((s) => {
                    if (!s) analytics.sourceViewed();
                    return !s;
                  });
                }}
                aria-expanded={showSource}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
              >
                📄 {showSource ? t("about.hideSource") : t("about.viewSource")}
              </button>
              <a
                href={nbrPressRelease}
                download="NBR-Press-Release-28-April-2026.jpeg"
                onClick={() => analytics.sourceDownloaded()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
              >
                ⬇ {t("about.download")}
              </a>
            </div>
            {showSource && (
              <div className="mt-4 overflow-hidden rounded-lg border border-border bg-white animate-in fade-in slide-in-from-top-2 duration-200">
                <img
                  src={nbrPressRelease}
                  alt="NBR Press Release dated 28 April 2026 announcing 72,341 TIN selection for Risk-Based Audit"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:py-5 text-center text-[11px] sm:text-xs text-muted-foreground space-y-1">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>
              {t("footer.builtBy")} <span className="text-[color:var(--warning)]">♥</span>{" "}
              {t("footer.builtBy2")}{" "}
              <a
                href="https://masifrahman.com/"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                M Asif Rahman
              </a>
            </span>
            <span className="opacity-40">·</span>
            <FooterGitHubLink />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>© {n(new Date().getFullYear())} · {t("footer.unofficial")}</span>
            <span className="opacity-40">·</span>
            <span>
              {t("footer.hostedBy")}{" "}
              <a
                href="https://xcloud.host/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                xCloud
              </a>
              {" "}{t("footer.hostedIn")}
            </span>
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
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 text-center">
      <div className="text-lg sm:text-2xl font-bold bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">{label}</div>
    </div>
  );
}
