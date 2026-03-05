"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";
import WritingAnalytics from "../../../components/WritingAnalytics";
import WaveBoundary from "../../../components/WaveBoundary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";

export default function AnalyticsPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/");
        return;
      }
      
      const role = data.session.user.user_metadata?.role;
      if (role !== "writer") {
        router.replace("/dashboard");
        return;
      }
      
      setUserId(data.session.user.id);
      setLoading(false);
    })();
  }, [supabase, router]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-inner max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <FontAwesomeIcon icon={faChartLine} className="text-2xl text-blue-400" />
            <div>
              <h1 className="page-title mb-0">Writing Analytics</h1>
              <p className="page-subtitle mb-0">Loading your writing data...</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Time range selector skeleton */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-card h-10 w-20" />
              ))}
            </div>
            
            {/* Metrics cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-card h-24" />
              ))}
            </div>
            
            {/* Chart skeleton */}
            <div className="skeleton-card h-64" />
            
            {/* Insights skeleton */}
            <div className="skeleton-card h-32" />
          </div>
        </div>
      </main>
    );
  }

  if (!userId) return null;

  return (
    <main className="page-shell">
      <div className="page-inner max-w-6xl page-with-wave">
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faChartLine} className="text-2xl text-blue-400" />
          <h1 className="page-title mb-0">Writing Analytics</h1>
        </div>
        <p className="page-subtitle mb-6">Track your writing progress and celebrate your growth</p>
        
        <WritingAnalytics userId={userId} />
        
        <WaveBoundary />
      </div>
    </main>
  );
}
