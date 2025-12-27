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

          if (uRole === "writer" || role === "writer")
            router.replace("/dashboard");
          else
            setMsg("Signed up as reader. You can explore without dashboard.");
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

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-32 w-32 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Subtle background */}
      <div className="flex flex-1 items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        {!session ? (
          <div className="w-full max-w-md rounded-2xl border border-gray-200/70 bg-white/80 text-gray-900 shadow-xl backdrop-blur dark:border-gray-800/70 dark:bg-gray-900/60 dark:text-gray-100">
            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Authentication"
              className="flex items-end border-b border-gray-200/70 px-6 pt-5 dark:border-gray-800/70"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "sign_up"}
                onClick={() => setMode("sign_up")}
                className={[
                  "relative -mb-px px-4 py-3 text-sm font-medium transition",
                  "border-b-2",
                  mode === "sign_up"
                    ? "border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100"
                    : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                ].join(" ")}
              >
                Sign up
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === "sign_in"}
                onClick={() => setMode("sign_in")}
                className={[
                  "relative -mb-px px-4 py-3 text-sm font-medium transition",
                  "border-b-2",
                  mode === "sign_in"
                    ? "border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100"
                    : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                ].join(" ")}
              >
                Sign in
              </button>

              <div className="ml-auto pb-3 text-xs text-gray-500 dark:text-gray-400">
                Writersphere
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition
                               focus:border-gray-900 focus:ring-4 focus:ring-gray-200
                               dark:border-gray-700 dark:bg-gray-800 dark:focus:border-gray-100 dark:focus:ring-gray-800"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Password
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition
                               focus:border-gray-900 focus:ring-4 focus:ring-gray-200
                               dark:border-gray-700 dark:bg-gray-800 dark:focus:border-gray-100 dark:focus:ring-gray-800"
                    placeholder="••••••••"
                  />
                </label>

                {mode === "sign_up" && (
                  <label className="block">
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Role
                    </span>
                    <select
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as "reader" | "writer")
                      }
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition
                                 focus:border-gray-900 focus:ring-4 focus:ring-gray-200
                                 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-gray-100 dark:focus:ring-gray-800"
                    >
                      <option value="writer">Writer</option>
                      <option value="reader">Reader</option>
                    </select>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition
                             hover:opacity-95 active:scale-[0.99] disabled:opacity-60
                             dark:bg-white dark:text-gray-900"
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

              {msg && (
                <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-200">
                  {msg}
                </p>
              )}
              {err && (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                  {err}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
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
