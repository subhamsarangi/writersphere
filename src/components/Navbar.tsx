// components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<"writer" | "reader" | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const router = useRouter();

  // Track supabase auth session
  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session ?? null;
      setSession(s);
      setRole(s?.user?.user_metadata?.role ?? null);

      const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) => {
        setSession(sess);
        setRole(sess?.user?.user_metadata?.role ?? null);
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
      router.replace("/");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link href="/" className="nav-brand">
          <FontAwesomeIcon icon={faPenNib} />
          Writersphere
        </Link>

        {session && role === "writer" && (
          <Link href="/dashboard" className="nav-link">
            <FontAwesomeIcon icon={faBookOpen} />
            Dashboard
          </Link>
        )}

        {session && role === "writer" && (
          <Link href="/dashboard/write" className="nav-link">
            <FontAwesomeIcon icon={faPenNib} />
            Write
          </Link>
        )}

        {session && role === "writer" && (
          <Link href="/dashboard/articles" className="nav-link">
            <FontAwesomeIcon icon={faBookOpen} />
            Articles
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {session && (
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
        )}
      </div>
    </nav>
  );
}
