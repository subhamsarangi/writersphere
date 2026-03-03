"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import WaveBoundary from "../../components/WaveBoundary";

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
  const displayName = user.user_metadata?.display_name || "Anonymous";
  const email = user.email || "No email";
  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown";

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

          {/* Actions */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Actions</h2>
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

        <WaveBoundary />
      </div>
    </main>
  );
}
