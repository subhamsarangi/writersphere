"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faUser, faChartLine } from "@fortawesome/free-solid-svg-icons";
import WaveBoundary from "../../components/WaveBoundary";
import LoadingLink from "../../components/LoadingLink";

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  );
}

export default function ProfilePage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [previewTheme, setPreviewTheme] = useState<"dawn" | "day" | "dusk" | "night" | null>(null);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Apply preview theme to navbar
  useEffect(() => {
    if (previewTheme) {
      document.documentElement.setAttribute('data-preview-theme', previewTheme);
    } else {
      document.documentElement.removeAttribute('data-preview-theme');
    }
  }, [previewTheme]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/");
        return;
      }
      setUser(data.session.user);
      setLoading(false);
    })();
  }, [supabase, router]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/");
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const role = user.user_metadata?.role || "reader";
  const isWriter = role === "writer";
  const displayName = user.user_metadata?.display_name || "Anonymous";
  const email = user.email || "No email";
  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown";
  
  // Format current time
  const timeString = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
  const dateString = currentTime.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <main className="page-shell">
      <div className="page-inner max-w-2xl page-with-wave">
        <div className="page-title">
          <FontAwesomeIcon icon={faUser} className="mr-2" />
          Profile
        </div>
        <p className="page-subtitle">View your account information</p>

        <div className="card-dashboard space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Personal Information</h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-slate-400 w-32">Display Name:</span>
                <span className="text-slate-100">{displayName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-slate-400 w-32">Email:</span>
                <span className="text-slate-100">{email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-slate-400 w-32">Role:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/40 text-blue-200 border border-blue-700/60">
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Account Information</h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-slate-400 w-32">Member Since:</span>
                <span className="text-slate-100">{createdAt}</span>
              </div>
            </div>
          </div>

          {/* Current Time */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Current Time</h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-slate-400 w-32">Local Time:</span>
                <span className="text-slate-100 font-mono text-lg">{timeString}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-slate-400 w-32">Date:</span>
                <span className="text-slate-100">{dateString}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-slate-400 w-32">Timezone:</span>
                <span className="text-slate-100">{timezone}</span>
              </div>
            </div>
          </div>

          {/* Theme Preview */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Navbar Theme Preview</h2>
            <p className="text-sm text-slate-400 mb-4">
              The navbar changes appearance based on time of day. Preview each theme below:
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setPreviewTheme(previewTheme === "dawn" ? null : "dawn")}
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  previewTheme === "dawn"
                    ? "border-orange-500 ring-2 ring-orange-500/50"
                    : "border-slate-700 hover:border-orange-500/50"
                }`}
              >
                <div className="aspect-video bg-gradient-to-r from-slate-900 via-orange-950/30 to-slate-900 relative">
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="preview-dawn" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                        <circle cx="25" cy="25" r="15" fill="none" stroke="#fb923c" strokeWidth="0.5" opacity="0.15" />
                        <circle cx="25" cy="25" r="10" fill="none" stroke="#fb923c" strokeWidth="0.5" opacity="0.15" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#preview-dawn)" />
                  </svg>
                </div>
                <div className="p-2 bg-slate-800/80 backdrop-blur-sm">
                  <p className="text-xs font-medium text-slate-200">Dawn</p>
                  <p className="text-xs text-slate-400">5am - 8am</p>
                </div>
              </button>

              <button
                onClick={() => setPreviewTheme(previewTheme === "day" ? null : "day")}
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  previewTheme === "day"
                    ? "border-blue-500 ring-2 ring-blue-500/50"
                    : "border-slate-700 hover:border-blue-500/50"
                }`}
              >
                <div className="aspect-video bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 relative">
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="preview-day" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                        <circle cx="5" cy="5" r="0.75" fill="#60a5fa" opacity="0.15" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#preview-day)" />
                  </svg>
                </div>
                <div className="p-2 bg-slate-800/80 backdrop-blur-sm">
                  <p className="text-xs font-medium text-slate-200">Day</p>
                  <p className="text-xs text-slate-400">8am - 5pm</p>
                </div>
              </button>

              <button
                onClick={() => setPreviewTheme(previewTheme === "dusk" ? null : "dusk")}
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  previewTheme === "dusk"
                    ? "border-purple-500 ring-2 ring-purple-500/50"
                    : "border-slate-700 hover:border-purple-500/50"
                }`}
              >
                <div className="aspect-video bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 relative">
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="preview-dusk" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="5" cy="5" r="0.75" fill="#c084fc" opacity="0.15" />
                        <circle cx="25" cy="15" r="1" fill="#c084fc" opacity="0.15" />
                        <circle cx="35" cy="30" r="0.75" fill="#c084fc" opacity="0.15" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#preview-dusk)" />
                  </svg>
                </div>
                <div className="p-2 bg-slate-800/80 backdrop-blur-sm">
                  <p className="text-xs font-medium text-slate-200">Dusk</p>
                  <p className="text-xs text-slate-400">5pm - 8pm</p>
                </div>
              </button>

              <button
                onClick={() => setPreviewTheme(previewTheme === "night" ? null : "night")}
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  previewTheme === "night"
                    ? "border-slate-500 ring-2 ring-slate-500/50"
                    : "border-slate-700 hover:border-slate-500/50"
                }`}
              >
                <div className="aspect-video bg-slate-900 relative">
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="preview-night" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="0.5" fill="#94a3b8" opacity="0.15" />
                        <circle cx="40" cy="15" r="0.75" fill="#94a3b8" opacity="0.15" />
                        <circle cx="25" cy="35" r="0.5" fill="#94a3b8" opacity="0.15" />
                        <line x1="10" y1="10" x2="25" y2="35" stroke="#94a3b8" strokeWidth="0.25" opacity="0.15" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#preview-night)" />
                  </svg>
                </div>
                <div className="p-2 bg-slate-800/80 backdrop-blur-sm">
                  <p className="text-xs font-medium text-slate-200">Night</p>
                  <p className="text-xs text-slate-400">8pm - 5am</p>
                </div>
              </button>
            </div>

            {previewTheme && (
              <div className="mt-4 p-3 rounded-lg bg-blue-900/20 border border-blue-700/50">
                <p className="text-sm text-blue-200">
                  <strong>Preview active:</strong> Look at the navbar above to see the {previewTheme} theme. Click the theme again to return to automatic mode.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Actions</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {isWriter && (
                <LoadingLink
                  href="/dashboard/analytics"
                  className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faChartLine} />
                  View Writing Analytics
                </LoadingLink>
              )}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn-danger w-full sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  {loggingOut && <Spinner />}
                  <FontAwesomeIcon icon={faRightFromBracket} /> Logout
                </span>
              </button>
            </div>
          </div>
        </div>

        <WaveBoundary />
      </div>
    </main>
  );
}
