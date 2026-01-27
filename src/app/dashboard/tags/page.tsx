"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import LoadingLink from "../../../components/LoadingLink";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";

type Role = "writer" | "reader";

function getRole(session: Session | null): Role | null {
  const raw: unknown = session?.user?.user_metadata?.role;
  if (raw === "writer" || raw === "reader") return raw;
  return null;
}

type TagRow = {
  id: string;
  name: string;
  created_at: string;
};

type ArticleTagRow = {
  tag_id: string;
  article_id: string;
};

type TagStat = {
  id: string;
  name: string;
  articleCount: number; // total linked articles (all statuses)
  publishedUsed: boolean; // used in >=1 published article
  createdAt: string;
};

function isTagRow(v: unknown): v is TagRow {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.created_at === "string"
  );
}

function isArticleTagRow(v: unknown): v is ArticleTagRow {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.tag_id === "string" && typeof o.article_id === "string";
}

function buildTagStats(
  tags: TagRow[],
  links: ArticleTagRow[],
  publishedUsedSet: Set<string>,
): TagStat[] {
  const counts = new Map<string, number>();
  for (const l of links) {
    counts.set(l.tag_id, (counts.get(l.tag_id) ?? 0) + 1);
  }

  const out: TagStat[] = tags.map((t) => ({
    id: t.id,
    name: t.name,
    articleCount: counts.get(t.id) ?? 0,
    publishedUsed: publishedUsedSet.has(t.id),
    createdAt: t.created_at,
  }));

  // Sort: published-used first, then usage desc, then alpha
  out.sort((a, b) => {
    if (a.publishedUsed !== b.publishedUsed) return a.publishedUsed ? -1 : 1;
    if (b.articleCount !== a.articleCount)
      return b.articleCount - a.articleCount;
    return a.name.localeCompare(b.name);
  });

  return out;
}

const INITIAL_LOAD = 20;
const LOAD_MORE_STEP = 10;

export default function TagsPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [pageSize, setPageSize] = useState<number>(INITIAL_LOAD);
  const [totalTags, setTotalTags] = useState<number>(0);

  const [stats, setStats] = useState<TagStat[]>([]);
  const [publishedUsedOverallCount, setPublishedUsedOverallCount] =
    useState<number>(0);

  const email = useMemo(() => session?.user?.email ?? null, [session]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stats;
    return stats.filter((s) => s.name.toLowerCase().includes(q));
  }, [query, stats]);

  const canLoadMore = totalTags > pageSize;

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      setError(null);

      const { data } = await supabase.auth.getSession();
      const s = data.session ?? null;
      setSession(s);

      const role = getRole(s);
      if (!s || role !== "writer") {
        router.replace("/");
        return;
      }

      const uid = s.user.id;

      // Total tags (for paging + "Load more" visibility)
      const totalRes = await supabase
        .from("tags")
        .select("*", { count: "exact", head: true })
        .eq("writer_id", uid);

      const total = totalRes.count ?? 0;
      setTotalTags(total);

      // Overall "used in published" count (for ALL your tags)
      // Note: no writer filter on articles — "published by anyone".
      // We only restrict to your tags via tags!inner(writer_id).
      const publishedOverallRes = await supabase
        .from("article_tags")
        .select("tag_id, tags!inner(writer_id), articles!inner(status)")
        .eq("tags.writer_id", uid)
        .eq("articles.status", "published");

      if (publishedOverallRes.error) {
        setError(publishedOverallRes.error.message);
        setPublishedUsedOverallCount(0);
      } else {
        const rows = Array.isArray(publishedOverallRes.data)
          ? (publishedOverallRes.data as unknown[])
          : [];

        const publishedTagIds = new Set<string>();
        for (const r of rows) {
          if (typeof r !== "object" || r === null) continue;
          const o = r as Record<string, unknown>;
          const tagId = o.tag_id;
          if (typeof tagId === "string") publishedTagIds.add(tagId);
        }
        setPublishedUsedOverallCount(publishedTagIds.size);
      }

      // Auth change listener
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

  // Fetch current page (20 first, then +10)
  useEffect(() => {
    (async () => {
      if (!ready || !session) return;

      setError(null);

      const role = getRole(session);
      if (role !== "writer") return;

      const uid = session.user.id;

      // Load tags page
      const tagsRes = await supabase
        .from("tags")
        .select("id,name,created_at")
        .eq("writer_id", uid)
        .order("created_at", { ascending: false })
        .range(0, Math.max(0, pageSize - 1));

      if (tagsRes.error) {
        setError(tagsRes.error.message);
        setStats([]);
        return;
      }

      const tagsRaw = Array.isArray(tagsRes.data)
        ? (tagsRes.data as unknown[])
        : [];
      const tags: TagRow[] = [];
      for (const r of tagsRaw) if (isTagRow(r)) tags.push(r);

      const tagIds = tags.map((t) => t.id);

      // Total usage counts (all statuses)
      let links: ArticleTagRow[] = [];
      if (tagIds.length > 0) {
        const linksRes = await supabase
          .from("article_tags")
          .select("tag_id,article_id")
          .in("tag_id", tagIds);

        if (linksRes.error) {
          setError(linksRes.error.message);
          setStats([]);
          return;
        }

        const linksRaw = Array.isArray(linksRes.data)
          ? (linksRes.data as unknown[])
          : [];

        links = linksRaw.filter(isArticleTagRow);
      }

      // Published usage set for loaded tags
      const publishedUsedSet = new Set<string>();
      if (tagIds.length > 0) {
        const publishedRes = await supabase
          .from("article_tags")
          .select("tag_id, articles!inner(status)")
          .in("tag_id", tagIds)
          .eq("articles.status", "published");

        if (publishedRes.error) {
          setError(publishedRes.error.message);
          setStats([]);
          return;
        }

        const pubRaw = Array.isArray(publishedRes.data)
          ? (publishedRes.data as unknown[])
          : [];

        for (const r of pubRaw) {
          if (typeof r !== "object" || r === null) continue;
          const o = r as Record<string, unknown>;
          const tagId = o.tag_id;
          if (typeof tagId === "string") publishedUsedSet.add(tagId);
        }
      }

      setStats(buildTagStats(tags, links, publishedUsedSet));
    })();
  }, [pageSize, ready, session, supabase]);

  if (!ready) {
    return (
      <main className="page-shell">
        <div className="page-inner grid gap-4">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-inner">
        <div className="flex items-center justify-between gap-3">
          <h1 className="page-title flex items-center gap-2">
            <FontAwesomeIcon icon={faTags} />
            Tags
          </h1>

          <LoadingLink
            href="/dashboard"
            className="btn-chip"
            loadingMode="append"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </LoadingLink>
        </div>

        {email ? <p className="page-subtitle">Signed in as {email}</p> : null}

        <div className="card-dashboard">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="card-meta-label">Total tags</p>
              <p className="card-meta-value">{totalTags}</p>
              <p className="mt-1 text-xs text-slate-400">
                Used in at least one published article:{" "}
                {publishedUsedOverallCount}
              </p>
            </div>

            <div className="w-full sm:max-w-sm">
              <label className="field-label">
                <span>Search</span>
                <input
                  className="field-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to filter…"
                />
              </label>
            </div>
          </div>

          {error ? <p className="alert-error mt-3">{error}</p> : null}
        </div>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400">
              {totalTags === 0
                ? "No tags yet. Tags will appear here once created via the editor."
                : "No tags match your search."}
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className={[
                    "btn-chip",
                    !t.publishedUsed ? "opacity-45" : "",
                  ].join(" ")}
                  title={
                    t.publishedUsed
                      ? "Used in at least one published article"
                      : "Not used in any published article"
                  }
                >
                  <span className="font-medium">#{t.name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-300">{t.articleCount}</span>
                </div>
              ))}
            </div>
          )}

          {/* Paging controls */}
          {query.trim().length === 0 && canLoadMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="btn-chip"
                onClick={() => {
                  setPageSize((prev) => {
                    const next = prev + LOAD_MORE_STEP;
                    return next > totalTags ? totalTags : next;
                  });
                }}
              >
                Load more
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
