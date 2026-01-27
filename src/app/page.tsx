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
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field-input"
                    placeholder="••••••••"
                  />
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

                    <label className="field-label">
                      <span>Role</span>
                      <select
                        value={role}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRole(v === "reader" ? "reader" : "writer");
                        }}
                        className="field-input"
                      >
                        <option value="writer">Writer</option>
                        <option value="reader">Reader</option>
                      </select>
                    </label>
                  </>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
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

              <div className="mt-4 flex items-center justify-between">
                <Link href="/feed" className="btn-chip">
                  View feed
                </Link>
                <span className="text-xs text-slate-500">
                  Writers go to Dashboard · Readers go to Feed
                </span>
              </div>

              {msg && <p className="alert-success mt-4">{msg}</p>}
              {err && <p className="alert-error mt-4">{err}</p>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
