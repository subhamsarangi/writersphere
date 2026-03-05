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
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

type Role = "writer" | "reader";

function pickRole(v: unknown): Role | null {
  return v === "writer" || v === "reader" ? v : null;
}

function getTimeOfDay(): "dawn" | "day" | "dusk" | "night" {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

export default function Navbar() {
  const supabase = getSupabaseBrowserClient();

  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<"dawn" | "day" | "dusk" | "night">("night");
  const [previewTheme, setPreviewTheme] = useState<"dawn" | "day" | "dusk" | "night" | null>(null);

  const brandHref = useMemo(() => (session ? "/feed" : "/"), [session]);

  // Check for preview theme override
  useEffect(() => {
    const checkPreview = () => {
      const preview = document.documentElement.getAttribute('data-preview-theme') as "dawn" | "day" | "dusk" | "night" | null;
      setPreviewTheme(preview);
    };
    
    checkPreview();
    
    // Watch for changes
    const observer = new MutationObserver(checkPreview);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-preview-theme'] });
    
    return () => observer.disconnect();
  }, []);

  // Update time of day every minute
  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

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

  // Time-based navbar styling (use preview theme if set)
  const activeTheme = previewTheme || timeOfDay;
  
  const navbarClass = useMemo(() => {
    const base = "navbar transition-colors duration-1000 relative";
    switch (activeTheme) {
      case "dawn":
        return `${base} bg-gradient-to-r from-slate-900 via-orange-950/30 to-slate-900`;
      case "day":
        return `${base} bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900`;
      case "dusk":
        return `${base} bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900`;
      case "night":
      default:
        return `${base} bg-slate-900`;
    }
  }, [activeTheme]);

  // SVG pattern for each time period
  const navbarPattern = useMemo(() => {
    const opacity = "0.15"; // Increased from 0.03 to 0.15
    
    switch (activeTheme) {
      case "dawn":
        // Sunrise rays pattern
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dawn-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="30" fill="none" stroke="#fb923c" strokeWidth="1" opacity={opacity} />
                <circle cx="50" cy="50" r="20" fill="none" stroke="#fb923c" strokeWidth="1" opacity={opacity} />
                <circle cx="50" cy="50" r="10" fill="none" stroke="#fb923c" strokeWidth="1" opacity={opacity} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dawn-pattern)" />
          </svg>
        );
      
      case "day":
        // Subtle dots pattern
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="day-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="#60a5fa" opacity={opacity} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#day-pattern)" />
          </svg>
        );
      
      case "dusk":
        // Stars pattern
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dusk-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="#c084fc" opacity={opacity} />
                <circle cx="50" cy="30" r="2" fill="#c084fc" opacity={opacity} />
                <circle cx="70" cy="60" r="1.5" fill="#c084fc" opacity={opacity} />
                <circle cx="30" cy="70" r="1.5" fill="#c084fc" opacity={opacity} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dusk-pattern)" />
          </svg>
        );
      
      case "night":
      default:
        // Constellation pattern
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="night-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#94a3b8" opacity={opacity} />
                <circle cx="80" cy="30" r="1.5" fill="#94a3b8" opacity={opacity} />
                <circle cx="50" cy="70" r="1" fill="#94a3b8" opacity={opacity} />
                <circle cx="30" cy="80" r="1.5" fill="#94a3b8" opacity={opacity} />
                <circle cx="70" cy="50" r="1" fill="#94a3b8" opacity={opacity} />
                <line x1="20" y1="20" x2="30" y2="80" stroke="#94a3b8" strokeWidth="0.5" opacity={opacity} />
                <line x1="80" y1="30" x2="70" y2="50" stroke="#94a3b8" strokeWidth="0.5" opacity={opacity} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#night-pattern)" />
          </svg>
        );
    }
  }, [activeTheme]);

  return (
    <nav className={navbarClass}>
      {/* SVG Pattern Background - clipped to navbar only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {navbarPattern}
      </div>
      
      <div className="nav-left relative z-10">
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

          {/* Analytics only for writers */}
          {session && role === "writer" && (
            <Link href="/dashboard/analytics" className="nav-link">
              <FontAwesomeIcon icon={faChartLine} />
              Analytics
            </Link>
          )}

          {/* Feed is available for everyone */}
          <Link href="/feed" className="nav-link">
            <FontAwesomeIcon icon={faBookOpen} />
            Feed
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        {/* Desktop Profile Link */}
        <Link 
          href={session ? "/profile" : "/?auth=true"} 
          className="hidden md:flex btn-ghost"
        >
          <FontAwesomeIcon icon={faUser} /> Profile
        </Link>

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
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-lg z-[60]">
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

                <Link 
                  href="/dashboard/analytics" 
                  className="nav-link !justify-start py-3 px-4 rounded-lg hover:bg-slate-800 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />
                  <span className="text-base">Analytics</span>
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

            <Link 
              href={session ? "/profile" : "/?auth=true"}
              className="nav-link !justify-start py-3 px-4 rounded-lg hover:bg-slate-800 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
              <span className="text-base">Profile</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
