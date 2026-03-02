"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faPenNib,
  faTableColumns,
  faBars,
  faXmark,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

type Role = "writer" | "reader";

function pickRole(v: unknown): Role | null {
  return v === "writer" || v === "reader" ? v : null;
}

export default function Navbar() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <nav className="navbar">
      <div className="nav-left">
        {/* Brand: auth users -> /feed, unauth -> / */}
        <Link href={brandHref} className="nav-brand">
          <FontAwesomeIcon icon={faPenNib} />
          Writersphere
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {/* Feed is available for everyone */}
          <Link href="/feed" className="nav-link">
            <FontAwesomeIcon icon={faBookOpen} />
            Feed
          </Link>

          {/* My Articles only for writers */}
          {session && role === "writer" && (
            <Link href="/dashboard/articles" className="nav-link">
              <FontAwesomeIcon icon={faPenNib} />
              My Articles
            </Link>
          )}

          {/* Dashboard only for writers */}
          {session && role === "writer" && (
            <Link href="/dashboard" className="nav-link">
              <FontAwesomeIcon icon={faTableColumns} />
              Dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Desktop Profile Link */}
        {session ? (
          <Link href="/profile" className="hidden md:flex btn-ghost">
            <FontAwesomeIcon icon={faUser} /> Profile
          </Link>
        ) : null}

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden btn-ghost p-2"
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-lg">
          <div className="flex flex-col p-4 gap-2">
            <Link 
              href="/feed" 
              className="nav-link !justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faBookOpen} />
              Feed
            </Link>

            {session && role === "writer" && (
              <>
                <Link 
                  href="/dashboard/articles" 
                  className="nav-link !justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faPenNib} />
                  My Articles
                </Link>

                <Link 
                  href="/dashboard" 
                  className="nav-link !justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faTableColumns} />
                  Dashboard
                </Link>
              </>
            )}

            {session && (
              <Link 
                href="/profile" 
                className="nav-link !justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faUser} />
                Profile
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
