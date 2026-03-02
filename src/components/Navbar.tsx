"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

          {/* Feed is available for everyone */}
          <Link href="/feed" className="nav-link">
            <FontAwesomeIcon icon={faBookOpen} />
            Feed
          </Link>
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

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed top-[64px] left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-lg z-50">
          <div className="flex flex-col p-4 gap-3">
            {session && role === "writer" && (
              <>
                <Link 
                  href="/dashboard/articles" 
                  className="nav-link !justify-start py-3 px-4 rounded-lg hover:bg-slate-800 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faPenNib} className="w-5 h-5" />
                  <span className="text-base">My Articles</span>
                </Link>

                <Link 
                  href="/dashboard" 
                  className="nav-link !justify-start py-3 px-4 rounded-lg hover:bg-slate-800 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faTableColumns} className="w-5 h-5" />
                  <span className="text-base">Dashboard</span>
                </Link>
              </>
            )}

            <Link 
              href="/feed" 
              className="nav-link !justify-start py-3 px-4 rounded-lg hover:bg-slate-800 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faBookOpen} className="w-5 h-5" />
              <span className="text-base">Feed</span>
            </Link>

            {session && (
              <Link 
                href="/profile" 
                className="nav-link !justify-start py-3 px-4 rounded-lg hover:bg-slate-800 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                <span className="text-base">Profile</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
