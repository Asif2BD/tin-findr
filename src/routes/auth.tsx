import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Audit Alerts | NBR Audit Checker" },
      {
        name: "description",
        content:
          "Sign in to enable NBR audit alerts. Save a TIN and get an email if it appears on a future risk-based audit list.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    // If already signed in, bounce to dashboard.
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/alerts/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/alerts/dashboard" },
        });
        if (error) throw error;
        // auto-confirm is on, session should be present
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await router.invalidate();
          navigate({ to: "/alerts/dashboard", replace: true });
        } else {
          setInfo("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await router.invalidate();
        navigate({ to: "/alerts/dashboard", replace: true });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setErr(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      await router.invalidate();
      navigate({ to: "/alerts/dashboard", replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to checker
          </Link>
          <Link to="/alerts" className="text-sm text-muted-foreground hover:text-foreground">
            About Audit Alerts
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Sign in to Audit Alerts</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Save a TIN and get notified if it appears on a future NBR audit list.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex gap-2 mb-4 p-1 rounded-lg bg-muted">
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  mode === "signin" ? "bg-background shadow" : "text-muted-foreground"
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  mode === "signup" ? "bg-background shadow" : "text-muted-foreground"
                }`}
              >
                Create account
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent transition disabled:opacity-50"
            >
              Continue with Google
            </button>

            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {err && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {err}
                </div>
              )}
              {info && (
                <div className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                  {info}
                </div>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-[image:var(--gradient-hero)] px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 transition"
              >
                {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing you accept that your email and any saved TIN will be
            stored in our database so we can send you audit alerts. See{" "}
            <Link to="/alerts" className="underline">what this feature does</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}