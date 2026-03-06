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
import WaveBoundary from "../../components/WaveBoundary";

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
      <div className="page-inner page-with-wave">
        {/* Header row (no redundant article CTA here anymore) */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            {email ? (
              <p className="page-subtitle mt-1">Signed in as {email}</p>
            ) : null}
          </div>
        </div>

        {/* Articles "hero" row */}
        <div className="mt-6">
          <div className="card-dashboard p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="card-icon mt-1 !h-14 !w-14 text-2xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faPenNib} />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      Articles
                    </h2>
                    <span className="text-sm text-slate-400">
                      Drafts and published posts
                    </span>
                  </div>

                  <div className="mt-3 flex items-end gap-3">
                    <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
                      {counts.articles}
                    </div>
                    <div className="pb-1 text-sm text-slate-400">total</div>
                  </div>

                  <p className="mt-3 text-sm text-slate-300">
                    Write something new, polish drafts, and manage what’s
                    published.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 sm:gap-4">
                <LoadingLink
                  href="/dashboard/write"
                  className="btn-new-draft"
                  loadingMode="overlay"
                >
                  <span className="inline-flex items-center gap-2">
                    <FontAwesomeIcon icon={faPlus} />
                    New draft
                  </span>
                </LoadingLink>

                <LoadingLink
                  href="/dashboard/articles"
                  loadingMode="append"
                  className="btn-chip !bg-transparent !border-transparent !px-0 !py-0 text-slate-200 hover:text-white hover:underline underline-offset-4"
                >
                  Manage articles →
                </LoadingLink>
              </div>
            </div>
          </div>
        </div>

        {/* Three cards row */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Categories */}
          <div className="card-dashboard flex flex-col p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="card-icon mt-1">
                <FontAwesomeIcon icon={faFolderTree} />
              </span>

              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  Categories
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Organize top-level topics
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-4xl font-semibold tracking-tight text-white">
                {counts.categories}
              </p>
            </div>

            <div className="mt-auto pt-5 flex flex-wrap items-center gap-2">
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
                Manage →
              </LoadingLink>
            </div>
          </div>

          {/* Subcategories */}
          <div className="card-dashboard flex flex-col p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="card-icon mt-1">
                <FontAwesomeIcon icon={faSitemap} />
              </span>

              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  Subcategories
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Nest topics under categories
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-4xl font-semibold tracking-tight text-white">
                {counts.subcategories}
              </p>
            </div>

            <div className="mt-auto pt-5 flex flex-wrap items-center gap-2">
              <LoadingLink
                href="/dashboard/subcategories/new"
                className="btn-chip"
                loadingMode="overlay"
              >
                <FontAwesomeIcon icon={faPlus} />
                New
              </LoadingLink>
            </div>
          </div>

          {/* Tags */}
          <div className="card-dashboard flex flex-col p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="card-icon mt-1">
                <FontAwesomeIcon icon={faTags} />
              </span>

              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  Tags
                </h3>
                <p className="mt-1 text-sm text-slate-400">Total</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-4xl font-semibold tracking-tight text-white">
                {counts.tags}
              </p>
            </div>

            <div className="mt-auto pt-5 flex flex-wrap items-center gap-2">
              <LoadingLink
                href="/dashboard/tags"
                className="btn-chip"
                loadingMode="append"
              >
                View →
              </LoadingLink>
            </div>
          </div>
        </div>

        <WaveBoundary />
      </div>
    </main>
  );
}
