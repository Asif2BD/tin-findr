## Goal

A separate opt-in flow where users create an account, save one or more TINs, and receive an email alert when a future dataset update contains a matching TIN. The existing homepage checker stays 100% browser-only and unchanged.

## Scope boundaries (non-negotiable)

- Homepage `/` (`src/routes/index.tsx`) untouched in behavior. No signup nudge on the result cards. Privacy claims on `/how-it-works` about the instant checker stay verbatim.
- New feature lives at `/alerts` (public marketing/signup) + `/alerts/dashboard` (authenticated). Clearly labeled as the tradeoff: "You save your TIN with us so we can check it for you when new lists drop."

## Prerequisites

Enable **Lovable Cloud** (Supabase) — needed for auth, DB, and email. Currently not enabled.

## Data model (new tables)

```
watched_tins
  id uuid pk
  user_id uuid → auth.users (cascade)
  tin text (12 digits, check constraint)
  label text nullable          -- e.g. "My TIN", "Spouse"
  created_at timestamptz
  last_checked_at timestamptz
  matched_at timestamptz nullable    -- set when a match is found & alert sent
  unique(user_id, tin)

alert_log
  id uuid pk
  user_id uuid
  tin text
  matched_source int             -- 0/1/2/3 etc from audit.json
  sent_at timestamptz
```

RLS: user can select/insert/delete their own `watched_tins`. `alert_log` service-role only. Standard grants per platform rules.

## Auth

Email/password + Google (Lovable Cloud defaults). Managed `_authenticated` layout gates `/alerts/dashboard`.

## Pages

1. **`/alerts`** (public): Explains the tradeoff clearly — "Unlike the instant checker, this feature stores your TIN in our database so we can re-check it when NBR publishes new lists. Opt in only if that's OK with you." CTA → sign in.
2. **`/_authenticated/alerts/dashboard`**: list saved TINs, add TIN (12-digit validation, immediate check against current dataset — if already selected, show it right away and mark `matched_at`), remove TIN, see status (Watching / Selected on <date>).

## Match-checking job

A server route `/api/public/alerts/check` (HMAC-signed) that:
- Loads `public/data/audit.json` (bundled with worker).
- Iterates `watched_tins` where `matched_at is null`.
- For each match: insert `alert_log`, update `matched_at`, send email via Lovable Emails (`audit-alert` template with masked TIN, zone, circle, year, source label, disclaimer, unsubscribe link).

Triggered manually after each dataset update (user runs it, or via pg_cron). Also runs inline when a user adds a new TIN.

## Email template

`src/lib/email-templates/audit-alert.tsx` — brand-consistent, includes NBR verify disclaimer and link to dashboard for removal.

## Copy updates

- `/how-it-works`: add a small section titled "Two separate features" — the instant checker (unchanged claims) vs the opt-in alerts (explicit: stored server-side, deletable anytime).
- `/faq`: 2 new Q&As covering the alerts feature.
- Nav: add "Get alerts" link in header (both EN + BN translations).

## What I need from you before starting

1. **Confirm Lovable Cloud can be enabled** (it provisions Supabase + email under the hood). Required — no way around it for stored TINs + email.
2. **Auth methods**: email/password only, or email/password + Google? (Default recommendation: both.)
3. **Job trigger**: fine to run the match-check manually via an admin button in the dashboard for now, or set up pg_cron to run daily?

Once you approve, I'll implement in this order: enable Cloud → migration → auth + `_authenticated` layout → `/alerts` + dashboard → server fns → email template + send route → check job → i18n + FAQ + how-it-works copy → publish.