import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/alerts")({
  component: AlertsLanding,
  head: () => ({
    meta: [
      { title: "Get NBR Audit Alerts by Email — Opt-in Monitoring" },
      {
        name: "description",
        content:
          "Optional, opt-in email alerts if your TIN appears in a future NBR risk-based audit list. Requires storing your TIN — different from the private homepage checker.",
      },
      { property: "og:title", content: "Get NBR Audit Alerts by Email" },
      {
        property: "og:description",
        content:
          "Opt in to email alerts if your TIN shows up in a future NBR audit list. Separate, opt-in feature — TIN is stored on our server.",
      },
      { property: "og:url", content: "https://check-tin.asif.dev/alerts" },
    ],
    links: [{ rel: "canonical", href: "https://check-tin.asif.dev/alerts" }],
  }),
});

function AlertsLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to instant checker
          </Link>
          <Link
            to="/auth"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--warning)]" />
            Opt-in feature · Requires an account
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Get an email if your{" "}
            <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
              TIN shows up
            </span>{" "}
            on a future audit list
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            NBR occasionally publishes updated audit-selection lists. This
            opt-in service checks your saved TIN against every new list and
            emails you if it appears.
          </p>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-4">
          <div className="rounded-2xl border-2 border-[color:var(--warning)] bg-[color:var(--accent)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-[color:var(--warning)] text-white flex items-center justify-center flex-shrink-0 font-bold">
                !
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-accent-foreground">
                  Read this before you sign up
                </h2>
                <p className="text-sm text-accent-foreground/90 mt-2 leading-relaxed">
                  Unlike the{" "}
                  <Link to="/" className="underline font-medium">
                    instant checker on the homepage
                  </Link>{" "}
                  — which never sends your TIN anywhere — this feature{" "}
                  <strong>stores your TIN in our database</strong> so we can
                  re-check it every time NBR publishes a new list.
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-accent-foreground/90 list-disc pl-5">
                  <li>Your email and saved TIN(s) are stored on our server.</li>
                  <li>
                    We only use them to check against new audit lists and to
                    email you if there is a match.
                  </li>
                  <li>
                    You can delete a saved TIN or your entire account at any
                    time from the dashboard.
                  </li>
                  <li>
                    We never sell or share your data. See{" "}
                    <Link to="/how-it-works" className="underline">
                      how this site works
                    </Link>
                    .
                  </li>
                </ul>
                <p className="text-sm text-accent-foreground/90 mt-3 leading-relaxed">
                  If you're not comfortable with this, please use the{" "}
                  <Link to="/" className="underline font-medium">
                    instant browser-only checker
                  </Link>{" "}
                  instead — it runs entirely on your device.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-10">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Ready to opt in?</div>
              <div className="text-sm text-muted-foreground">
                Create a free account with email or Google.
              </div>
            </div>
            <Link
              to="/auth"
              className="rounded-lg bg-[image:var(--gradient-hero)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95 transition whitespace-nowrap"
            >
              I understand — sign me up
            </Link>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            <Feature title="Free" body="No cost, no ads, no upsells." />
            <Feature title="Auto-checked" body="Every new NBR list re-scanned automatically." />
            <Feature title="Deletable" body="Remove any TIN or your whole account anytime." />
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 py-4 text-center text-xs text-muted-foreground">
          Unofficial community tool · Not affiliated with NBR ·{" "}
          <Link to="/faq" className="underline">FAQ</Link>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{body}</div>
    </div>
  );
}