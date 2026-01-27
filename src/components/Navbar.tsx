"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faBookOpen,
  faPenNib,
  faTableColumns,
} from "@fortawesome/free-solid-svg-icons";

type Role = "writer" | "reader";

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

export default function Navbar() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const brandHref = useMemo(() => (session ? "/feed" : "/"), [session]);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session ?? null;
      setSession(s);
      setRole(pickRole(s?.user?.user_metadata?.role));

      const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) => {
        setSession(sess);
        setRole(pickRole(sess?.user?.user_metadata?.role));
      });

      unsub = listener?.subscription?.unsubscribe;
    })();

    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, [supabase]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setRole(null);
      router.replace("/");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        {/* Brand: auth users -> /feed, unauth -> / */}
        <Link href={brandHref} className="nav-brand">
          <FontAwesomeIcon icon={faPenNib} />
          Writersphere
        </Link>

        {/* Feed is available for everyone */}
        <Link href="/feed" className="nav-link">
          <FontAwesomeIcon icon={faBookOpen} />
          Feed
        </Link>

        {/* Dashboard only for writers */}
        {session && role === "writer" && (
          <Link href="/dashboard" className="nav-link">
            <FontAwesomeIcon icon={faTableColumns} />
            Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {session ? (
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn-danger"
          >
            <span className="inline-flex items-center gap-2">
              {loggingOut && <Spinner />}
              <FontAwesomeIcon icon={faRightFromBracket} /> Logout
            </span>
          </button>
        ) : // empty statement
        null}
      </div>
    </nav>
  );
}
