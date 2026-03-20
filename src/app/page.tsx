"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingView from "../components/landing/LandingView";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";
import Footer from "../components/Footer";
import type { Session } from "@supabase/supabase-js";

const supabase = getSupabaseBrowserClient();

type Mode = "sign_in" | "sign_up";
type Role = "reader" | "writer";

function pickRole(v: unknown): Role | null {
  return v === "writer" || v === "reader" ? v : null;
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Landing vs auth form toggle (unauth only)
  const [showAuth, setShowAuth] = useState(false);

  // Check for 'auth' query parameter to auto-open auth modal
  useEffect(() => {
    if (searchParams.get('auth') === 'true') {
      setShowAuth(true);
    }
  }, [searchParams]);

  // Auth UI
  const [mode, setMode] = useState<Mode>("sign_up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("writer");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const redirectForRole = useMemo(() => {
    const r = pickRole(session?.user?.user_metadata?.role);
    return r === "writer" ? "/dashboard" : "/feed";
  }, [session]);

  // Load session, and if already logged in -> route immediately
  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session ?? null;
      setSession(s);
      setReady(true);

      if (s) {
        const r = pickRole(s.user.user_metadata?.role);
        router.replace(r === "writer" ? "/dashboard" : "/feed");
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_e, s2) => {
        setSession(s2);
        if (s2) {
          const r = pickRole(s2.user.user_metadata?.role);
          router.replace(r === "writer" ? "/dashboard" : "/feed");
        }
      });

      unsub = listener?.subscription?.unsubscribe;
    })();

    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      if (mode === "sign_up") {
        const dn = displayName.trim();

        if (dn.length < 2) {
          setErr("Display name must be at least 2 characters.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              display_name: dn,
            },
          },
        });

        if (error) {
          if (error.message?.toLowerCase().includes("already")) {
            setErr("This email is already registered. Switching to sign in.");
            setMode("sign_in");
          } else {
            setErr(error.message);
          }
          return;
        }

        // Create default category and subcategory for writers
        if (data.user && role === "writer") {
          try {
            // Create default category
            const { data: categoryData, error: catError } = await supabase
              .from("categories")
              .insert({
                writer_id: data.user.id,
                name: "General",
              })
              .select("id")
              .single();

            if (!catError && categoryData) {
              // Create default subcategory
              await supabase
                .from("subcategories")
                .insert({
                  writer_id: data.user.id,
                  category_id: categoryData.id,
                  name: "Uncategorized",
                });
            }
          } catch (e) {
            // Silently fail - user can create categories manually
            console.error("Failed to create default categories:", e);
          }
        }

        // If session returned immediately, route now
        if (data.session) {
          const r = pickRole(data.session.user.user_metadata?.role) ?? role;
          router.replace(r === "writer" ? "/dashboard" : "/feed");
          return;
        }

        // Otherwise email confirmation flow
        setMsg("Check your inbox to confirm your email before signing in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErr(error.message);
          return;
        }

        const r = pickRole(data.user?.user_metadata?.role) ?? "reader";
        router.replace(r === "writer" ? "/dashboard" : "/feed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <main className="page-shell">
        <div className="w-full flex flex-col items-center justify-center py-36 px-6 gap-5 animate-pulse">
          {/* headline */}
          <div className="h-12 md:h-16 w-72 md:w-96 rounded-2xl bg-slate-800/60" />
          <div className="h-12 md:h-16 w-56 md:w-72 rounded-2xl bg-slate-800/60" />
          {/* subtitle */}
          <div className="h-5 w-64 md:w-80 rounded-xl bg-slate-800/40 mt-2" />
          <div className="h-5 w-48 md:w-64 rounded-xl bg-slate-800/40" />
          {/* cta button */}
          <div className="h-11 w-40 rounded-full bg-slate-700/50 mt-4" />
        </div>
      </main>
    );
  }

  // If we have a session, user is being redirected by effect. Keep UI minimal.
  if (session) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <div className="card-dashboard w-full max-w-xl text-center">
            <div className="page-title">Taking you there…</div>
            <p className="text-sm text-slate-400 mt-2">
              Redirecting to{" "}
              <span className="text-slate-200">{redirectForRole}</span>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Unauthenticated: show landing OR auth form
  if (!showAuth) {
    return (
      <>
      <main className="page-shell">
        <LandingView
          onGetStarted={() => { setMode("sign_up"); setShowAuth(true); }}
          onSignIn={() => { setMode("sign_in"); setShowAuth(true); }}
        />
      </main>
      <Footer />
      </>
    );
  }

  return (
    <>
    <main className="page-shell">
      <div className="page-center md:p-12 lg:p-16">
          <div className="card-auth">
            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Authentication"
              className="tabs-auth"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "sign_up"}
                onClick={() => setMode("sign_up")}
                className={`tab-auth ${mode === "sign_up" ? "tab-auth-active" : ""}`}
              >
                Sign up
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === "sign_in"}
                onClick={() => setMode("sign_in")}
                className={`tab-auth ${mode === "sign_in" ? "tab-auth-active" : ""}`}
              >
                Sign in
              </button>

              <button
                type="button"
                className="ml-auto btn-chip"
                onClick={() => setShowAuth(false)}
              >
                Back
              </button>
            </div>

            {/* Form */}
            <div className="card-auth-body">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="field-label">
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field-input"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="field-label">
                  <span>Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="field-input pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>

                {mode === "sign_up" ? (
                  <>
                    <label className="field-label">
                      <span>Display name</span>
                      <input
                        type="text"
                        required
                        minLength={2}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="field-input"
                        placeholder="e.g., Alex"
                        autoCapitalize="words"
                      />
                    </label>

                    <div className="field-label">
                      <span>Role</span>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <label
                          className={`role-card ${role === "writer" ? "role-card-active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value="writer"
                            checked={role === "writer"}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            <div className="text-center">
                              <div className="font-medium">Writer + Reader</div>
                              <div className="text-xs text-slate-400 mt-0.5">Create & explore</div>
                            </div>
                          </div>
                        </label>

                        <label
                          className={`role-card ${role === "reader" ? "role-card-active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value="reader"
                            checked={role === "reader"}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                            <div className="text-center">
                              <div className="font-medium">Reader</div>
                              <div className="text-xs text-slate-400 mt-0.5">Explore only</div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className={mode === "sign_up" ? "btn-auth-signup" : "btn-auth-signin"}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading && <Spinner />}
                    {mode === "sign_up"
                      ? loading
                        ? "Creating account…"
                        : "Create account"
                      : loading
                        ? "Signing in…"
                        : "Sign in"}
                  </span>
                </button>
              </form>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500">or</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setErr(null);
                  await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/`,
                    },
                  });
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm font-medium transition hover:bg-slate-800 hover:border-slate-500 disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setErr(null);
                  await supabase.auth.signInWithOAuth({
                    provider: "github",
                    options: {
                      redirectTo: `${window.location.origin}/`,
                    },
                  });
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm font-medium transition hover:bg-slate-800 hover:border-slate-500 disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-current" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                Continue with GitHub
              </button>

              {msg && <p className="alert-success mt-4">{msg}</p>}
              {err && <p className="alert-error mt-4">{err}</p>}
            </div>
          </div>
      </div>
    </main>
    <Footer />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="page-shell">
        <div className="w-full flex flex-col items-center justify-center py-36 px-6 gap-5 animate-pulse">
          <div className="h-12 md:h-16 w-72 md:w-96 rounded-2xl bg-slate-800/60" />
          <div className="h-12 md:h-16 w-56 md:w-72 rounded-2xl bg-slate-800/60" />
          <div className="h-5 w-64 md:w-80 rounded-xl bg-slate-800/40 mt-2" />
          <div className="h-5 w-48 md:w-64 rounded-xl bg-slate-800/40" />
          <div className="h-11 w-40 rounded-full bg-slate-700/50 mt-4" />
        </div>
      </main>
    }>
      <HomePageContent />
    </Suspense>
  );
}
