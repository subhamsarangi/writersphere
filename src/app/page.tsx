// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

const supabase = getSupabaseBrowserClient();

type Mode = "sign_in" | "sign_up";

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign_up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"reader" | "writer">("writer");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // NEW: separate "ready" to prevent UI flash
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
      // cleanup (guard against undefined)
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

  // NEW: block render until we know the session to avoid splash of the auth box
  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {/* Skeleton or nothing; replace with your own shimmer if you like */}
        <div className="h-32 w-32 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex flex-1 items-center justify-center p-6">
        {!session ? (
          <div className="w-full max-w-md bg-white text-gray-900 p-6 rounded-xl shadow dark:bg-gray-800 dark:text-gray-100">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMode("sign_up")}
                className={`px-3 py-2 rounded border ${
                  mode === "sign_up"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-white dark:bg-gray-700 dark:text-gray-100"
                }`}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => setMode("sign_in")}
                className={`px-3 py-2 rounded border ${
                  mode === "sign_in"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-white dark:bg-gray-700 dark:text-gray-100"
                }`}
              >
                Sign in
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="text-sm">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm">Password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100"
                  placeholder="••••••••"
                />
              </label>

              {mode === "sign_up" && (
                <label className="block">
                  <span className="text-sm">Role</span>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "reader" | "writer")
                    }
                    className="mt-1 w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="writer">Writer</option>
                    <option value="reader">Reader</option>
                  </select>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-gray-900 text-white py-2 disabled:opacity-60 dark:bg-white dark:text-gray-900"
              >
                {loading
                  ? mode === "sign_up"
                    ? "Creating account…"
                    : "Signing in…"
                  : mode === "sign_up"
                  ? "Create account"
                  : "Sign in"}
              </button>
            </form>

            {msg && (
              <p
                className="mt-3 text-sm text-green-700 dark:text-green-400"
                aria-live="polite"
              >
                {msg}
              </p>
            )}
            {err && (
              <p
                className="mt-3 text-sm text-red-700 dark:text-red-400"
                aria-live="polite"
              >
                {err}
              </p>
            )}
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
