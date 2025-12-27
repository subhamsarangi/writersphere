// components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoon,
  faSun,
  faRightFromBracket,
  faBookOpen,
  faPenNib,
} from "@fortawesome/free-solid-svg-icons";

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  );
}
export default function Navbar() {
  const supabase = getSupabaseBrowserClient();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<"writer" | "reader" | null>(null);
  const router = useRouter();

  // Sync initial theme
  useEffect(() => {
    const hasDark = document.documentElement.classList.contains("dark");
    setTheme(hasDark ? "dark" : "light");
  }, []);

  // Track supabase auth session
  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session ?? null;
      setSession(s);
      setRole(s?.user?.user_metadata?.role ?? null);

      const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s);
        setRole(s?.user?.user_metadata?.role ?? null);
      });
      unsub = listener?.subscription?.unsubscribe;
    })();

    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next === "dark" ? "dark" : "light";
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      router.replace("/");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1 font-semibold">
          <FontAwesomeIcon icon={faPenNib} />
          Writersphere
        </Link>
        {session && role === "writer" && (
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm hover:underline"
          >
            <FontAwesomeIcon icon={faBookOpen} />
            Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          aria-label="Toggle theme"
        >
          <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
        </button>

        {/* Conditionally render logout */}
        {session && (
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-3 py-1 rounded-lg border text-sm transition
                   hover:bg-red-100 hover:text-red-700
                   dark:hover:bg-red-800 dark:hover:text-red-100
                   disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-2">
              {loggingOut && <Spinner />}
              <FontAwesomeIcon icon={faRightFromBracket} /> Logout
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
