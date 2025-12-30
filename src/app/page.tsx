// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

const supabase = getSupabaseBrowserClient();

type Mode = "sign_in" | "sign_up";

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
  const [mode, setMode] = useState<Mode>("sign_up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"reader" | "writer">("writer");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setReady(true);

      const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s);
      });
      unsub = listener?.subscription?.unsubscribe;
    })();

    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      if (mode === "sign_up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role } },
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

        if (data.session) {
          const uRole = data.session.user.user_metadata?.role as
            | "reader"
            | "writer"
            | undefined;

          if (uRole === "writer" || role === "writer") {
            router.replace("/dashboard");
          } else {
            setMsg("Signed up as reader. You can explore without dashboard.");
          }
        } else {
          setMsg("Check your inbox to confirm your email before signing in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setErr(error.message);
          return;
        }

        const uRole = data.user?.user_metadata?.role as
          | "reader"
          | "writer"
          | undefined;
        if (uRole === "writer") router.replace("/dashboard");
        else setMsg("Signed in as reader.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Skeleton while we don't know the session yet
  if (!ready) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-center">
        {!session ? (
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
                className={`tab-auth ${
                  mode === "sign_up" ? "tab-auth-active" : ""
                }`}
              >
                Sign up
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === "sign_in"}
                onClick={() => setMode("sign_in")}
                className={`tab-auth ${
                  mode === "sign_in" ? "tab-auth-active" : ""
                }`}
              >
                Sign in
              </button>

              <div className="ml-auto pb-3 text-xs text-slate-400">
                Writersphere
              </div>
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

                {mode === "sign_up" && (
                  <label className="field-label">
                    <span>Role</span>
                    <select
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as "reader" | "writer")
                      }
                      className="field-input"
                    >
                      <option value="writer">Writer</option>
                      <option value="reader">Reader</option>
                    </select>
                  </label>
                )}

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

              {msg && <p className="alert-success">{msg}</p>}
              {err && <p className="alert-error">{err}</p>}
            </div>
          </div>
        ) : (
          <div className="page-inner text-center">
            <h2 className="text-2xl font-semibold mb-2">
              Welcome{session.user?.email ? `, ${session.user.email}` : ""}!
            </h2>
            {session.user?.user_metadata?.role === "reader" ? (
              <p>
                You’re signed in as a <strong>reader</strong>. Enjoy exploring!
              </p>
            ) : (
              <p>
                You’re signed in as a <strong>writer</strong>. Check your
                dashboard for more.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
