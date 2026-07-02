import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  addWatchedTin,
  listWatchedTins,
  recheckAllWatchedTins,
  removeWatchedTin,
} from "@/lib/alerts.functions";

export const Route = createFileRoute("/_authenticated/alerts/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Your Audit Alerts — Dashboard" },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
});

type WatchedTin = {
  id: string;
  tin: string;
  label: string | null;
  created_at: string;
  last_checked_at: string | null;
  matched_at: string | null;
  matched_source: number | null;
};

function maskTin(t: string) {
  if (t.length <= 4) return t;
  return `${t.slice(0, 2)}${"•".repeat(Math.max(t.length - 4, 4))}${t.slice(-2)}`;
}

function Dashboard() {
  const router = useRouter();
  const [rows, setRows] = useState<WatchedTin[]>([]);
  const [loading, setLoading] = useState(true);
  const [tin, setTin] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  async function refresh() {
    setLoading(true);
    try {
      const data = (await listWatchedTins()) as WatchedTin[];
      setRows(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    refresh();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (tin.length !== 12) {
      setErr("TIN must be exactly 12 digits.");
      return;
    }
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await addWatchedTin({ data: { tin, label: label || null } });
      if (res.immediateMatch) {
        setNotice(
          `Heads-up: this TIN is ALREADY on the current audit list (${res.immediateMatch.zone}, AY ${res.immediateMatch.assessment_year}). It has been saved and marked as matched.`,
        );
      } else {
        setNotice("Saved. We'll email you if it appears on a future list.");
      }
      setTin("");
      setLabel("");
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Delete this saved TIN? We'll stop monitoring it.")) return;
    await removeWatchedTin({ data: { id } });
    await refresh();
  }

  async function handleRecheckAll() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await recheckAllWatchedTins();
      setNotice(
        `Rechecked ${res.checked} watched TIN(s). ${res.newlyMatched} new match(es).`,
      );
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    await router.invalidate();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground truncate">
            ← Instant checker
          </Link>
          <div className="flex items-center gap-3">
            {email && <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[200px]">{email}</span>}
            <button
              onClick={handleSignOut}
              className="text-xs rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-accent"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-8 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Your audit alerts</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We'll email <strong className="text-foreground">{email || "you"}</strong>{" "}
            if any of your saved TINs appears on a future NBR audit list.
          </p>

          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            Reminder: TINs saved here are stored in our database. Delete them
            anytime with the trash button below.
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-6">
          <form
            onSubmit={handleAdd}
            className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-[var(--shadow-card)]"
          >
            <h2 className="text-lg font-semibold">Watch a new TIN</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="12-digit TIN"
                  value={tin}
                  onChange={(e) => setTin(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-base font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-ring"
                  maxLength={12}
                />
                <input
                  type="text"
                  placeholder="Optional label (e.g. 'My TIN', 'Spouse')"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  maxLength={60}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                disabled={busy || tin.length !== 12}
                className="rounded-lg bg-[image:var(--gradient-hero)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] disabled:opacity-50 transition whitespace-nowrap"
              >
                {busy ? "Saving…" : "Save & watch"}
              </button>
            </div>
            {err && (
              <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {err}
              </div>
            )}
            {notice && (
              <div className="mt-3 rounded-md border border-border bg-muted px-3 py-2 text-xs text-foreground">
                {notice}
              </div>
            )}
          </form>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Watched TINs ({rows.length})</h2>
            <button
              onClick={handleRecheckAll}
              disabled={busy || rows.length === 0}
              className="text-xs rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-accent disabled:opacity-50"
            >
              Recheck now
            </button>
          </div>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              You haven't saved any TINs yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-sm">{maskTin(r.tin)}</div>
                    {r.label && (
                      <div className="text-xs text-muted-foreground truncate">{r.label}</div>
                    )}
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {r.matched_at ? (
                        <span className="text-[color:var(--warning)] font-medium">
                          ⚠ Selected — matched {new Date(r.matched_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <>
                          Watching · last checked{" "}
                          {r.last_checked_at
                            ? new Date(r.last_checked_at).toLocaleDateString()
                            : "just now"}
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(r.id)}
                    className="text-xs rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition self-start sm:self-auto"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}