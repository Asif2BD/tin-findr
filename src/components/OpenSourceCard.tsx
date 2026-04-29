import { useI18n } from "@/i18n";
import { analytics } from "@/lib/analytics";

export const REPO_URL = "https://github.com/Asif2BD/tin-findr";

export function OpenSourceCard() {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-[var(--shadow-card)] flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="h-10 w-10 rounded-lg bg-foreground text-background flex items-center justify-center flex-shrink-0">
        <GitHubIcon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base">{t("oss.title")}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {t("oss.body")}
        </p>
      </div>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => analytics.externalLink(REPO_URL)}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition flex-shrink-0"
      >
        <GitHubIcon className="h-4 w-4" />
        {t("oss.cta")}
      </a>
    </div>
  );
}

export function FooterGitHubLink() {
  const { t } = useI18n();
  return (
    <div className="mt-2 text-[11px] sm:text-xs">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => analytics.externalLink(REPO_URL)}
        className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
      >
        <GitHubIcon className="h-3.5 w-3.5" />
        {t("footer.openSource")}
      </a>
    </div>
  );
}

export function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.98 10.98 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}