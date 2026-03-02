"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";
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

export default function HomePage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Landing vs auth form toggle (unauth only)
  const [showAuth, setShowAuth] = useState(false);

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
        <div className="page-center">
          <div className="skeleton-card" />
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
  return (
    <main className="page-shell">
      <div className="page-center">
        {!showAuth ? (
          <div className="card-dashboard w-full max-w-2xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Writersphere</div>
              <p className="mt-2 text-slate-300">
                Read great writing from everyone. Write when you’re ready.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/feed" className="btn-primary text-center">
                Explore Feed
              </Link>

              <button
                type="button"
                className="btn-chip"
                onClick={() => setShowAuth(true)}
              >
                Sign in / Sign up
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 text-xs text-slate-400">
              <div className="card-dashboard">
                <div className="font-medium text-slate-200">Public feed</div>
                <div className="mt-1">
                  Chronological posts from all writers.
                </div>
              </div>
              <div className="card-dashboard">
                <div className="font-medium text-slate-200">Tags & topics</div>
                <div className="mt-1">Discover posts the way you like.</div>
              </div>
              <div className="card-dashboard">
                <div className="font-medium text-slate-200">Write anytime</div>
                <div className="mt-1">Draft, publish, manage your content.</div>
              </div>
            </div>
          </div>
        ) : (
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

              {msg && <p className="alert-success mt-4">{msg}</p>}
              {err && <p className="alert-error mt-4">{err}</p>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
