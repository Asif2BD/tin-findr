import { createFileRoute, Link } from "@tanstack/react-router";
import { LanguageToggle, useI18n } from "@/i18n";
import { FooterGitHubLink } from "@/components/OpenSourceCard";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorks,
  head: () => ({
    meta: [
      { title: "How it works — NBR Audit Checker" },
      {
        name: "description",
        content:
          "How the NBR Audit Checker works under the hood: 100% client-side TIN lookup, no data collection, privacy-respecting self-hosted analytics.",
      },
      { property: "og:title", content: "How it works — NBR Audit Checker" },
      {
        property: "og:description",
        content:
          "Your TIN never leaves your browser. Here's exactly how the lookup works and what (little) data we collect.",
      },
      { property: "og:url", content: "https://check-tin.asif.dev/how-it-works" },
    ],
    links: [
      { rel: "canonical", href: "https://check-tin.asif.dev/how-it-works" },
    ],
  }),
});

function HowItWorks() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-[image:var(--gradient-hero)] flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg shadow-[var(--shadow-elegant)] flex-shrink-0">
              N
            </div>
            <div className="min-w-0">
              <div className="font-semibold leading-tight text-sm sm:text-base truncate">
                {t("header.brand")}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground tracking-wide uppercase truncate">
                {t("how.tagline")}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <LanguageToggle />
            <Link
              to="/"
              className="hidden sm:inline text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t("how.back")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-8 sm:pt-12 pb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] sm:text-xs text-muted-foreground mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
            {t("how.badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            {t("how.title.a")}{" "}
            <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
              {t("how.title.b")}
            </span>
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            {t("how.subtitle")}
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-10 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {t("how.steps.heading")}
          </h2>
          <Step n={1} title={t("how.step1.title")} body={t("how.step1.body")} />
          <Step n={2} title={t("how.step2.title")} body={t("how.step2.body")} />
          <Step n={3} title={t("how.step3.title")} body={t("how.step3.body")} />
          <Step n={4} title={t("how.step4.title")} body={t("how.step4.body")} />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-10">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              {t("how.flow.title")}
            </h2>
            <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-[11px] sm:text-xs leading-relaxed text-foreground/90 font-mono">
{`  ┌──────────────────────────────┐
  │     Your browser (you)       │
  │                              │
  │   TIN: 1234•••••5678  ◄──────┼── stays here, always
  │           │                  │
  │           ▼                  │
  │   match against audit.json   │
  │           │                  │
  │           ▼                  │
  │   "Selected" / "Not selected"│
  └──────────────┬───────────────┘
                 │
                 │  (only the static files travel
                 │   over the network — never your TIN)
                 ▼
  ┌──────────────────────────────┐
  │     Our CDN / web host       │
  │   serves: HTML, JS, CSS,     │
  │           audit.json         │
  └──────────────────────────────┘`}
            </pre>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("how.flow.note")}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-10">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg sm:text-xl font-semibold">
              {t("how.analytics.title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {t("how.analytics.body")}{" "}
              <strong className="text-foreground">{t("how.analytics.notGA")}</strong>
              {t("how.analytics.notGA2")}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-[color:var(--success)]">✓</span>
                <span>{t("how.analytics.b1")}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[color:var(--success)]">✓</span>
                <span>{t("how.analytics.b2")}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[color:var(--success)]">✓</span>
                <span>{t("how.analytics.b3")}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[color:var(--success)]">✓</span>
                <span>{t("how.analytics.b4")}</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-10">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg sm:text-xl font-semibold">
              {t("how.tech.title")}
            </h2>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <TechItem label={t("how.tech.frontend")} value={t("how.tech.frontend.v")} />
              <TechItem label={t("how.tech.hosting")} value={t("how.tech.hosting.v")} />
              <TechItem label={t("how.tech.db")} value={t("how.tech.db.v")} />
              <TechItem label={t("how.tech.analytics")} value={t("how.tech.analytics.v")} />
              <TechItem label={t("how.tech.source")} value={t("how.tech.source.v")} />
              <TechItem label={t("how.tech.backend")} value={t("how.tech.backend.v")} />
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-hero)] px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95 transition"
          >
            {t("how.backCta")}
          </Link>
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
          <div>© {new Date().getFullYear()} · {t("footer.unofficial")}</div>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-[var(--shadow-card)] flex gap-4">
      <div className="h-9 w-9 rounded-full bg-[image:var(--gradient-hero)] text-primary-foreground font-bold flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-elegant)]">
        {n}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-base sm:text-lg">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function TechItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-card/70 border border-border/60 p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}