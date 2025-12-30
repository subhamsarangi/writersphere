// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderTree, faPlus } from "@fortawesome/free-solid-svg-icons";
import LoadingLink from "../../components/LoadingLink";

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [counts, setCounts] = useState<{
    categories: number;
    subcategories: number;
  }>({
    categories: 0,
    subcategories: 0,
  });

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      // 1) session + writer gate
      const { data } = await supabase.auth.getSession();
      const s = data.session ?? null;
      setSession(s);

      const role = s?.user?.user_metadata?.role;
      if (!s || role !== "writer") {
        router.replace("/"); // readers / non-auth → home
        return;
      }

      // 2) counts (parallel)
      const uid = s.user.id;
      const [catRes, subRes] = await Promise.all([
        supabase
          .from("categories")
          .select("*", { count: "exact", head: true })
          .eq("writer_id", uid),
        supabase
          .from("subcategories")
          .select("*", { count: "exact", head: true })
          .eq("writer_id", uid),
      ]);

      setCounts({
        categories: catRes.count ?? 0,
        subcategories: subRes.count ?? 0,
      });

      // 3) listen to auth changes; if role changes or logout → home
      const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) => {
        const newRole = sess?.user?.user_metadata?.role;
        if (!sess || newRole !== "writer") {
          router.replace("/");
        } else {
          setSession(sess);
        }
      });
      unsub = listener?.subscription?.unsubscribe;

      setReady(true);
    })();

    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, [router, supabase]);

  // Simple skeleton while loading
  if (!ready) {
    return (
      <main className="page-shell">
        <div className="page-inner grid gap-4 sm:grid-cols-2">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-inner">
        <h1 className="page-title">Dashboard</h1>

        {session?.user?.email && (
          <h3 className="page-subtitle">Signed in as {session.user.email}</h3>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Categories card */}
          <div className="card-dashboard">
            <div className="card-header">
              <div className="card-header-left">
                <span className="card-icon">
                  <FontAwesomeIcon icon={faFolderTree} />
                </span>
                <div>
                  <p className="card-meta-label">Categories</p>
                  <p className="card-meta-value">{counts.categories}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LoadingLink
                  href="/dashboard/categories/new"
                  className="btn-chip"
                  loadingMode="overlay"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  New
                </LoadingLink>
                <LoadingLink
                  href="/dashboard/categories"
                  className="btn-chip"
                  loadingMode="append"
                >
                  Manage
                </LoadingLink>
              </div>
            </div>
          </div>

          {/* Articles  card */}
          <LoadingLink
            href="/dashboard/articles"
            className="btn-chip"
            loadingMode="append"
          >
            My Articles
          </LoadingLink>
        </div>
      </div>
    </main>
  );
}
