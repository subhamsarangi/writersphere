"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";
import LoadingLink from "@/components/LoadingLink";
import Footer from "@/components/Footer";

type FeedArticle = {
  id: string;
  title: string | null;
  published_at: string | null;
  updated_at: string | null;
  tags?: string[];
};

function fmt(ts: string | null): string {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function isFeedArticle(v: unknown): v is FeedArticle {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    "title" in o &&
    "published_at" in o &&
    "updated_at" in o
  );
}

const INITIAL_LOAD = 10;
const LOAD_MORE_STEP = 5;

export default function FeedPage() {
  const supabase = getSupabaseBrowserClient();

  const [items, setItems] = useState<FeedArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search: type freely, execute only on Enter
  const [searchInput, setSearchInput] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState<string>("");

  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Guard: don’t allow observer-triggered loadMore until initial fetch completes
  const didInitialLoadRef = useRef<boolean>(false);

  // Query key: increments only when we reset (new search / initial load)
  const queryKeyRef = useRef<number>(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(() => {
    return appliedSearch.trim() ? `Feed — “${appliedSearch.trim()}”` : "Feed";
  }, [appliedSearch]);

  const fetchPage = useCallback(
    async (start: number, size: number, search: string, queryKey: number) => {
      const q = search.trim();
      
      const res = await supabase.rpc("get_published_articles_feed", {
        p_search: q.length > 0 ? q : null,
        p_offset: start,
        p_limit: size,
      });

      // If a reset happened while this request was in-flight, ignore it.
      if (queryKey !== queryKeyRef.current) {
        return { rows: [] as FeedArticle[], done: false, ignored: true };
      }

      if (res.error) {
        throw new Error(res.error.message);
      }

      const raw: unknown = res.data;
      const articles = Array.isArray(raw) ? raw.filter(isFeedArticle) : [];

      // Tags are already included in the function response as jsonb
      for (const article of articles) {
        const tagArray = article.tags || [];
        article.tags = Array.isArray(tagArray) ? tagArray : [];
      }

      const done = articles.length < size;

      return { rows: articles, done, ignored: false };
    },
    [supabase],
  );

  const loadInitial = useCallback(async () => {
    // Invalidate any in-flight requests from prior renders
    queryKeyRef.current += 1;
    const myKey = queryKeyRef.current;

    didInitialLoadRef.current = false;

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setItems([]);
    setOffset(0);
    setHasMore(true);

    try {
      const { rows, done, ignored } = await fetchPage(
        0,
        INITIAL_LOAD,
        appliedSearch,
        myKey,
      );
      if (ignored) return;

      setItems(rows);
      setOffset(rows.length);
      setHasMore(!done);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      setHasMore(false);
    } finally {
      didInitialLoadRef.current = true;
      setLoading(false);
    }
  }, [appliedSearch, fetchPage]);

  const loadMore = useCallback(async () => {
    if (!didInitialLoadRef.current) return; // <- critical: avoid initial/loadMore race
    if (loading || loadingMore || !hasMore) return;

    const myKey = queryKeyRef.current;

    setLoadingMore(true);
    setError(null);

    try {
      const { rows, done, ignored } = await fetchPage(
        offset,
        LOAD_MORE_STEP,
        appliedSearch,
        myKey,
      );
      if (ignored) return;

      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const next = [...prev];
        for (const r of rows) {
          if (!seen.has(r.id)) next.push(r);
        }
        return next;
      });

      setOffset((prev) => prev + rows.length);
      setHasMore(!done);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [appliedSearch, fetchPage, hasMore, loading, loadingMore, offset]);

  // Initial load + reload on applied search change
  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    // Don’t attach observer while initial loading
    if (loading) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first) return;
        if (first.isIntersecting) {
          void loadMore();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.01 },
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [loadMore, loading]);

  return (
    <>
    <main className="page-shell">
      <div className="page-inner max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">
              Public articles from everyone, newest first.
            </p>
          </div>
        </div>

        {/* Search (Enter-only) */}
        <div className="mt-5">
          <div className="relative">
            <input
              className="field-input pl-10"
              value={searchInput}
              placeholder="Search articles… (press Enter)"
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setAppliedSearch(searchInput.trim());
                }
              }}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {appliedSearch.trim() ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-400">Searching for:</span>
              <span className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-200">
                {appliedSearch.trim()}
              </span>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-200 underline"
                onClick={() => {
                  setSearchInput("");
                  setAppliedSearch("");
                }}
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>

        {error ? <p className="alert-error mt-4">{error}</p> : null}

        {loading ? (
          <div className="mt-4 grid gap-3 !max-w-full">
            <div className="skeleton-card !max-w-full h-25" />
            <div className="skeleton-card !max-w-full h-40" />
            <div className="skeleton-card !max-w-full h-25" />
          </div>
        ) : items.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">
            No published articles found.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {items.map((a) => (
              <LoadingLink
                key={a.id}
                href={`/articles/${a.id}`}
                className="card-dashboard block transition hover:bg-slate-800/60 hover:border-slate-600 active:bg-slate-800/80 cursor-pointer text-left"
                loadingMode="overlay"
              >
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-white break-words">
                    {a.title?.trim() ? a.title : "Untitled"}
                  </div>
                  <div className="mt-1 text-xs text-slate-400 break-words">
                    {a.published_at ? (
                      <>Published: {fmt(a.published_at)}</>
                    ) : (
                      <>Published</>
                    )}
                    {a.updated_at ? (
                      <> · Updated: {fmt(a.updated_at)}</>
                    ) : null}
                  </div>
                  {a.tags && a.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {a.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                            tag.toLowerCase() === "poetry"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-slate-700/50 text-slate-300 border border-slate-600/50"
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </LoadingLink>
            ))}

            <div ref={sentinelRef} />

            {loadingMore ? (
              <div className="text-center text-sm text-slate-400 py-4">
                Loading more…
              </div>
            ) : null}

            {!hasMore ? (
              <div className="text-center text-xs text-slate-500 py-4">
                You’ve reached the end.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </main>
    <Footer />
    </>
  );
}
