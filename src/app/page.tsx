"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";
import Footer from "../components/Footer";
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

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Landing vs auth form toggle (unauth only)
  const [showAuth, setShowAuth] = useState(false);

  // Check for 'auth' query parameter to auto-open auth modal
  useEffect(() => {
    if (searchParams.get('auth') === 'true') {
      setShowAuth(true);
    }
  }, [searchParams]);

  // Auth UI
  const [mode, setMode] = useState<Mode>("sign_up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("writer");
  const [showPassword, setShowPassword] = useState(false);

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

        // Create default category and subcategory for writers
        if (data.user && role === "writer") {
          try {
            // Create default category
            const { data: categoryData, error: catError } = await supabase
              .from("categories")
              .insert({
                writer_id: data.user.id,
                name: "General",
              })
              .select("id")
              .single();

            if (!catError && categoryData) {
              // Create default subcategory
              await supabase
                .from("subcategories")
                .insert({
                  writer_id: data.user.id,
                  category_id: categoryData.id,
                  name: "Uncategorized",
                });
            }
          } catch (e) {
            // Silently fail - user can create categories manually
            console.error("Failed to create default categories:", e);
          }
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
    <>
    <main className="page-shell">
      <div className="page-center md:p-12 lg:p-16">
        {!showAuth ? (
          <div className="card-dashboard-main w-full md:max-w-5xl lg:max-w-6xl p-10 md:p-16 lg:p-20 animate-fade-in">
            <div className="relative z-10 text-center px-4 md:px-12 animate-fade-in-up">
              <div className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.02em', color: '#D4C5B0' }}>
                Writersphere
              </div>
              <p className="text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Merriweather, serif' }}>
                A sanctuary for writers who think too much.
                <span className="block mt-3 text-amber-300/90">Start writing without freezing.</span>
              </p>
            </div>

            <div className="relative z-10 mt-12 md:mt-16 flex flex-col sm:flex-row gap-4 justify-center px-4 md:px-12 animate-fade-in-up animation-delay-100">
              <Link href="/feed" className="btn-primary text-center text-base md:text-lg py-4 px-8 inline-flex items-center justify-center gap-3 min-w-[200px]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                </svg>
                Explore Writing
              </Link>

              <button
                type="button"
                className="btn-chip text-base md:text-lg py-4 px-8 inline-flex items-center justify-center gap-3 min-w-[200px] border-slate-600 hover:border-slate-500"
                onClick={() => setShowAuth(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Get Started
              </button>
            </div>

            <div className="relative z-10 mt-16 md:mt-20 grid gap-6 md:grid-cols-3 px-4 md:px-12">
              <div className="relative animate-fade-in-up animation-delay-200 overflow-hidden group">
                <svg className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105" viewBox="0 0 300 280" preserveAspectRatio="none" style={{ transform: 'rotate(180deg)' }}>
                  <defs>
                    <clipPath id="soil-clip">
                      <path d="M 55 6 C 28 8, 12 22, 7 48 L 5 110 C 4 145, 5 175, 6 215 C 8 245, 20 268, 45 273 L 255 274 C 278 271, 290 255, 294 230 L 296 170 C 297 135, 296 105, 294 65 C 291 35, 275 12, 250 7 Z" />
                    </clipPath>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'rgba(74, 111, 56, 0.4)', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: 'rgba(88, 129, 68, 0.35)', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: 'rgba(65, 95, 50, 0.3)', stopOpacity: 1 }} />
                    </linearGradient>
                    <pattern id="leaf-veins-1" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                      <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(88, 129, 68, 0.3)" strokeWidth="2" />
                      <line x1="50" y1="20" x2="20" y2="35" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="40" x2="25" y2="50" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="60" x2="20" y2="70" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="80" x2="25" y2="88" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="20" x2="80" y2="35" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="40" x2="75" y2="50" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="60" x2="80" y2="70" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="80" x2="75" y2="88" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <g clipPath="url(#soil-clip)">
                    <path d="M 55 6 C 28 8, 12 22, 7 48 L 5 110 C 4 145, 5 175, 6 215 C 8 245, 20 268, 45 273 L 255 274 C 278 271, 290 255, 294 230 L 296 170 C 297 135, 296 105, 294 65 C 291 35, 275 12, 250 7 Z" 
                      fill="url(#grad1)" />
                    <path d="M 55 6 C 28 8, 12 22, 7 48 L 5 110 C 4 145, 5 175, 6 215 C 8 245, 20 268, 45 273 L 255 274 C 278 271, 290 255, 294 230 L 296 170 C 297 135, 296 105, 294 65 C 291 35, 275 12, 250 7 Z" 
                      fill="url(#leaf-veins-1)" 
                      opacity="0.6" />
                  </g>
                  <path d="M 55 6 C 28 8, 12 22, 7 48 L 5 110 C 4 145, 5 175, 6 215 C 8 245, 20 268, 45 273 L 255 274 C 278 271, 290 255, 294 230 L 296 170 C 297 135, 296 105, 294 65 C 291 35, 275 12, 250 7 Z" 
                    fill="none"
                    stroke="rgba(74, 111, 56, 0.6)" 
                    strokeWidth="1.5" />
                </svg>
                <div className="relative p-8 md:p-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-amber-700/30 to-orange-900/30 border border-amber-800/40 flex items-center justify-center backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-amber-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                  </div>
                  <div className="font-bold text-lg md:text-xl mb-3 text-center" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)', color: '#B8E6B8', fontFamily: 'Merriweather, serif', fontWeight: 700 }}>
                    Exploration Over Performance
                  </div>
                  <div className="mt-3 text-center text-slate-100 text-sm leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)' }}>
                    Write to discover, not to impress. Your thoughts deserve space to breathe.
                  </div>
                </div>
              </div>
              <div className="relative animate-fade-in-up animation-delay-300 overflow-hidden group">
                <svg className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105" viewBox="0 0 300 280" preserveAspectRatio="none">
                  <defs>
                    <clipPath id="leaf-clip">
                      <path d="M 42 5 C 22 7, 9 20, 5 42 L 4 125 C 3 155, 4 185, 6 225 C 9 252, 22 272, 48 276 L 252 277 C 280 274, 293 258, 296 235 L 297 155 C 298 125, 297 95, 295 55 C 292 28, 278 8, 255 5 Z" />
                    </clipPath>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'rgba(74, 111, 56, 0.4)', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: 'rgba(88, 129, 68, 0.35)', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: 'rgba(65, 95, 50, 0.3)', stopOpacity: 1 }} />
                    </linearGradient>
                    <pattern id="leaf-veins" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                      <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(88, 129, 68, 0.3)" strokeWidth="2" />
                      <line x1="50" y1="20" x2="20" y2="35" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="40" x2="25" y2="50" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="60" x2="20" y2="70" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="80" x2="25" y2="88" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="20" x2="80" y2="35" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="40" x2="75" y2="50" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="60" x2="80" y2="70" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="80" x2="75" y2="88" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <g clipPath="url(#leaf-clip)">
                    <path d="M 42 5 C 22 7, 9 20, 5 42 L 4 125 C 3 155, 4 185, 6 225 C 9 252, 22 272, 48 276 L 252 277 C 280 274, 293 258, 296 235 L 297 155 C 298 125, 297 95, 295 55 C 292 28, 278 8, 255 5 Z" 
                      fill="url(#grad2)" />
                    <path d="M 42 5 C 22 7, 9 20, 5 42 L 4 125 C 3 155, 4 185, 6 225 C 9 252, 22 272, 48 276 L 252 277 C 280 274, 293 258, 296 235 L 297 155 C 298 125, 297 95, 295 55 C 292 28, 278 8, 255 5 Z" 
                      fill="url(#leaf-veins)" 
                      opacity="0.6" />
                  </g>
                  <path d="M 42 5 C 22 7, 9 20, 5 42 L 4 125 C 3 155, 4 185, 6 225 C 9 252, 22 272, 48 276 L 252 277 C 280 274, 293 258, 296 235 L 297 155 C 298 125, 297 95, 295 55 C 292 28, 278 8, 255 5 Z" 
                    fill="none"
                    stroke="rgba(74, 111, 56, 0.6)" 
                    strokeWidth="1.5" />
                </svg>
                <div className="relative p-8 md:p-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-green-700/30 to-green-900/30 border border-green-700/40 flex items-center justify-center backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-green-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                      </svg>
                    </div>
                  </div>
                  <div className="font-bold text-lg md:text-xl mb-3 text-center" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)', color: '#B8E6B8', fontFamily: 'Merriweather, serif', fontWeight: 700 }}>
                    Structure for Overthinkers
                  </div>
                  <div className="mt-3 text-center text-slate-100 text-sm leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)' }}>
                    Organize your thoughts with categories, tags, and a system that works with your mind.
                  </div>
                </div>
              </div>
              <div className="relative animate-fade-in-up animation-delay-400 overflow-hidden group">
                <svg className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105" viewBox="0 0 300 280" preserveAspectRatio="none">
                  <defs>
                    <clipPath id="paper-clip">
                      <path d="M 50 4 C 25 6, 10 18, 6 40 L 4 120 C 3 150, 4 180, 5 220 C 7 250, 18 270, 40 274 L 260 276 C 285 274, 294 262, 296 240 L 297 160 C 298 130, 297 100, 296 60 C 294 30, 282 10, 260 6 Z" />
                    </clipPath>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'rgba(74, 111, 56, 0.4)', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: 'rgba(88, 129, 68, 0.35)', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: 'rgba(65, 95, 50, 0.3)', stopOpacity: 1 }} />
                    </linearGradient>
                    <pattern id="leaf-veins-3" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(90 50 50)">
                      <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(88, 129, 68, 0.3)" strokeWidth="2" />
                      <line x1="50" y1="20" x2="20" y2="35" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="40" x2="25" y2="50" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="60" x2="20" y2="70" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="80" x2="25" y2="88" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="20" x2="80" y2="35" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="40" x2="75" y2="50" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="60" x2="80" y2="70" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                      <line x1="50" y1="80" x2="75" y2="88" stroke="rgba(88, 129, 68, 0.2)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <g clipPath="url(#paper-clip)">
                    <path d="M 50 4 C 25 6, 10 18, 6 40 L 4 120 C 3 150, 4 180, 5 220 C 7 250, 18 270, 40 274 L 260 276 C 285 274, 294 262, 296 240 L 297 160 C 298 130, 297 100, 296 60 C 294 30, 282 10, 260 6 Z" 
                      fill="url(#grad3)" />
                    <path d="M 50 4 C 25 6, 10 18, 6 40 L 4 120 C 3 150, 4 180, 5 220 C 7 250, 18 270, 40 274 L 260 276 C 285 274, 294 262, 296 240 L 297 160 C 298 130, 297 100, 296 60 C 294 30, 282 10, 260 6 Z" 
                      fill="url(#leaf-veins-3)" 
                      opacity="0.6" />
                  </g>
                  <path d="M 50 4 C 25 6, 10 18, 6 40 L 4 120 C 3 150, 4 180, 5 220 C 7 250, 18 270, 40 274 L 260 276 C 285 274, 294 262, 296 240 L 297 160 C 298 130, 297 100, 296 60 C 294 30, 282 10, 260 6 Z" 
                    fill="none"
                    stroke="rgba(74, 111, 56, 0.6)" 
                    strokeWidth="1.5" />
                </svg>
                <div className="relative p-8 md:p-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-amber-600/30 to-yellow-800/30 border border-amber-700/40 flex items-center justify-center backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-amber-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </div>
                  </div>
                  <div className="font-bold text-lg md:text-xl mb-3 text-center" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)', color: '#B8E6B8', fontFamily: 'Merriweather, serif', fontWeight: 700 }}>
                    Reflection Through Writing
                  </div>
                  <div className="mt-3 text-center text-slate-100 text-sm leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)' }}>
                    Track your progress, understand your patterns, and grow as a writer with built-in analytics.
                  </div>
                </div>
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
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="field-input pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
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

                    <div className="field-label">
                      <span>Role</span>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <label
                          className={`role-card ${role === "writer" ? "role-card-active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value="writer"
                            checked={role === "writer"}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            <div className="text-center">
                              <div className="font-medium">Writer + Reader</div>
                              <div className="text-xs text-slate-400 mt-0.5">Create & explore</div>
                            </div>
                          </div>
                        </label>

                        <label
                          className={`role-card ${role === "reader" ? "role-card-active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value="reader"
                            checked={role === "reader"}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                            <div className="text-center">
                              <div className="font-medium">Reader</div>
                              <div className="text-xs text-slate-400 mt-0.5">Explore only</div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className={mode === "sign_up" ? "btn-auth-signup" : "btn-auth-signin"}
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

              {msg && <p className="alert-success mt-4">{msg}</p>}
              {err && <p className="alert-error mt-4">{err}</p>}
            </div>
          </div>
        )}
      </div>
    </main>
    <Footer />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="page-shell">
        <div className="page-center">
          <div className="skeleton-card" />
        </div>
      </main>
    }>
      <HomePageContent />
    </Suspense>
  );
}
