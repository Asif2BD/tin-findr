import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { I18nProvider } from "@/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NBR Audit Selection 2023-24 — TIN Checker" },
      { name: "description", content: "Check if your TIN appears in NBR's Risk-Based Audit Selection list (AY 2023-24). Instant, offline, in-browser lookup across 87,685 returns." },
      { name: "author", content: "M Asif Rahman" },
      { property: "og:title", content: "NBR Audit Selection 2023-24 — TIN Checker" },
      { property: "og:description", content: "Instantly check if your TIN was selected for NBR audit (AY 2023-24)." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "NBR Audit Checker" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        src: "https://agent-analytics.asif.dev/script.js",
        defer: true,
        "data-website-id": "dff585f9-cb8c-44a9-84a7-fc45e2eca443",
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://check-tin.asif.dev/#website",
              url: "https://check-tin.asif.dev/",
              name: "NBR Audit Checker",
              description:
                "Check if your TIN appears in NBR's Risk-Based Audit Selection list for Assessment Year 2023-24.",
              inLanguage: "en",
              publisher: { "@id": "https://check-tin.asif.dev/#org" },
            },
            {
              "@type": "Organization",
              "@id": "https://check-tin.asif.dev/#org",
              name: "NBR Audit Checker",
              url: "https://check-tin.asif.dev/",
              founder: {
                "@type": "Person",
                name: "M Asif Rahman",
                url: "https://masifrahman.com/",
              },
              sameAs: ["https://github.com/Asif2BD/tin-findr"],
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <I18nProvider>
      <Outlet />
    </I18nProvider>
  );
}
