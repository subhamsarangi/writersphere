"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderTree,
  faSitemap,
  faPenNib,
  faTags,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import LoadingLink from "../../components/LoadingLink";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";

type Role = "writer" | "reader";

function getRole(session: Session | null): Role | null {
  const raw = (session?.user?.user_metadata?.role as unknown) ?? null;
  if (raw === "writer" || raw === "reader") return raw;
  return null;
}

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const [counts, setCounts] = useState<{
    categories: number;
    subcategories: number;
    articles: number;
    tags: number;
  }>({
    categories: 0,
    subcategories: 0,
    articles: 0,
    tags: 0,
  });

  const email = useMemo(() => session?.user?.email ?? null, [session]);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session ?? null;
      setSession(s);

      const role = getRole(s);
      if (!s || role !== "writer") {
        router.replace("/");
        return;
      }

      const uid = s.user.id;

      const [catRes, subRes, artRes, tagRes] = await Promise.all([
        supabase
          .from("categories")
          .select("*", { count: "exact", head: true })
          .eq("writer_id", uid),

        supabase
          .from("subcategories")
          .select("*", { count: "exact", head: true })
          .eq("writer_id", uid),

        supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("writer_id", uid)
          .neq("status", "deleted"),

        supabase
          .from("tags")
          .select("*", { count: "exact", head: true })
          .eq("writer_id", uid),
      ]);

      setCounts({
        categories: catRes.count ?? 0,
        subcategories: subRes.count ?? 0,
        articles: artRes.count ?? 0,
        tags: tagRes.count ?? 0,
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) => {
        const newRole = getRole(sess);
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

  if (!ready) {
    return (
      <main className="page-shell">
        <div className="page-inner grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-inner">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            {email ? (
              <p className="page-subtitle mt-1">Signed in as {email}</p>
            ) : null}
          </div>

          {/* Primary CTA */}
          <div className="flex items-center gap-2">
            <LoadingLink
              href="/dashboard/write"
              className="btn-chip"
              loadingMode="overlay"
            >
              <FontAwesomeIcon icon={faPlus} />
              New draft
            </LoadingLink>

            <LoadingLink
              href="/dashboard/articles"
              className="btn-chip"
              loadingMode="append"
            >
              Manage articles
            </LoadingLink>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Categories */}
          <div className="card-dashboard flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="card-icon">
                  <FontAwesomeIcon icon={faFolderTree} />
                </span>
                <div>
                  <p className="card-meta-label">Categories</p>
                  <p className="text-xs text-slate-400">
                    Organize top-level topics
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tight text-white">
                {counts.categories}
              </p>
            </div>

            <div className="mt-auto pt-4 flex items-center gap-2">
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

          {/* Subcategories */}
          <div className="card-dashboard flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="card-icon">
                  <FontAwesomeIcon icon={faSitemap} />
                </span>
                <div>
                  <p className="card-meta-label">Subcategories</p>
                  <p className="text-xs text-slate-400">
                    Nest topics under categories
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tight text-white">
                {counts.subcategories}
              </p>
            </div>

            <div className="mt-auto pt-4 flex items-center gap-2">
              <LoadingLink
                href="/dashboard/subcategories/new"
                className="btn-chip"
                loadingMode="overlay"
              >
                <FontAwesomeIcon icon={faPlus} />
                New
              </LoadingLink>
              <LoadingLink
                href="/dashboard/subcategories"
                className="btn-chip"
                loadingMode="append"
              >
                Manage
              </LoadingLink>
            </div>
          </div>

          {/* Articles */}
          <div className="card-dashboard flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="card-icon">
                  <FontAwesomeIcon icon={faPenNib} />
                </span>
                <div>
                  <p className="card-meta-label">Articles</p>
                  <p className="text-xs text-slate-400">
                    Drafts and published posts
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tight text-white">
                {counts.articles}
              </p>
            </div>

            <div className="mt-auto pt-4 flex items-center gap-2">
              <LoadingLink
                href="/dashboard/write"
                className="btn-chip"
                loadingMode="overlay"
              >
                <FontAwesomeIcon icon={faPlus} />
                New
              </LoadingLink>
              <LoadingLink
                href="/dashboard/articles"
                className="btn-chip"
                loadingMode="append"
              >
                Manage
              </LoadingLink>
            </div>
          </div>

          {/* Tags */}
          <div className="card-dashboard flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="card-icon">
                  <FontAwesomeIcon icon={faTags} />
                </span>
                <div>
                  <p className="card-meta-label">Tags</p>
                  <p className="text-xs text-slate-400">Total</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tight text-white">
                {counts.tags}
              </p>
            </div>

            <div className="mt-auto pt-4 flex items-center gap-2">
              <LoadingLink
                href="/dashboard/tags"
                className="btn-chip"
                loadingMode="append"
              >
                View
              </LoadingLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
