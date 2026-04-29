import { createFileRoute, Link } from "@tanstack/react-router";
import { LanguageToggle, useI18n } from "@/i18n";
import { FooterGitHubLink } from "@/components/OpenSourceCard";

export const Route = createFileRoute("/faq")({
  component: FAQ,
  head: () => ({
    meta: [
      { title: "FAQ — NBR Audit Checker" },
      {
        name: "description",
        content:
          "Frequently asked questions about the NBR Audit Checker — what it can and cannot do, important limitations, data sources, and privacy.",
      },
      { property: "og:title", content: "FAQ — NBR Audit Checker" },
      {
        property: "og:description",
        content:
          "Honest answers about the NBR Audit Checker, including the limits of what this tool can verify.",
      },
    ],
  }),
});

function FAQ() {
  const { t } = useI18n();

  const items: { q: string; a: string }[] = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
    { q: t("faq.q8"), a: t("faq.a8") },
  ];

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
                {t("faq.tagline")}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <LanguageToggle />
            <Link
              to="/"
              className="hidden sm:inline text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t("faq.back")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-8 sm:pt-12 pb-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            {t("faq.title")}
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-6">
          <div className="rounded-2xl border-2 border-[color:var(--warning)] bg-[color:var(--accent)] p-4 sm:p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[color:var(--warning)] text-white flex items-center justify-center flex-shrink-0 font-bold">
                !
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-accent-foreground">
                  {t("faq.limit.title")}
                </h2>
                <p className="mt-1 text-sm text-accent-foreground/90 leading-relaxed">
                  {t("faq.limit.body")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-10 space-y-3">
          {items.map((it, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-[var(--shadow-card)] open:bg-card"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                <h3 className="font-semibold text-base sm:text-lg pr-2">
                  {it.q}
                </h3>
                <span className="mt-1 h-6 w-6 flex-shrink-0 rounded-full border border-border text-xs flex items-center justify-center text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {it.a}
              </p>
            </details>
          ))}

          <p className="pt-4 text-center text-xs text-muted-foreground">
            {t("faq.contact")}
          </p>
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