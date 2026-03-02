"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";
import BackButton from "../../../components/BackButton";
import LoadingLink from "../../../components/LoadingLink";

type ArticleStatus =
  | "draft"
  | "published"
  | "unpublished"
  | "archived"
  | "deleted";

type CategoryOpt = { id: string; name: string };
type SubcategoryOpt = { id: string; name: string; category_id: string };

type ArticleRowDb = {
  id: string;
  title: string | null;
  status: ArticleStatus;
  updated_at: string | null;
  last_saved_at: string | null;
  created_at: string | null;
  categories: { name: string | null }[] | null;
  subcategories: { name: string | null }[] | null;
};

type ArticleRow = {
  id: string;
  title: string;
  status: ArticleStatus;
  updated_at: string | null;
  last_saved_at: string | null;
  created_at: string | null;
  category_name: string | null;
  subcategory_name: string | null;
};

function normalizeTag(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}
function uniqueTags(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of list) {
    const n = normalizeTag(t);
    if (!n) continue;
    const key = n.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}
function fmt(ts: string | null) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function ArticlesPage() {
  const supabase = getSupabaseBrowserClient();

  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [cats, setCats] = useState<CategoryOpt[]>([]);
  const [subs, setSubs] = useState<SubcategoryOpt[]>([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | ArticleStatus>("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  const [tagInput, setTagInput] = useState("");
  const [tagFilters, setTagFilters] = useState<string[]>([]);

  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const debounceRef = useRef<number | null>(null);

  const canFetch = Boolean(uid);

  const filtersSummary = useMemo(() => {
    const parts: string[] = [];
    if (q.trim()) parts.push(`Search: "${q.trim()}"`);
    if (status) parts.push(`Status: ${status}`);
    if (categoryId) parts.push(`Category set`);
    if (subcategoryId) parts.push(`Subcategory set`);
    if (tagFilters.length) parts.push(`Tags: ${tagFilters.join(", ")}`);
    return parts.length ? parts.join(" · ") : "No filters";
  }, [q, status, categoryId, subcategoryId, tagFilters]);

  function addTagFilter(raw: string) {
    const next = uniqueTags([...tagFilters, raw]);
    setTagFilters(next);
    setTagInput("");
  }
  function removeTagFilter(name: string) {
    const key = name.toLowerCase();
    setTagFilters((t) => t.filter((x) => x.toLowerCase() !== key));
  }
  function clearAll() {
    setQ("");
    setStatus("");
    setCategoryId("");
    setSubcategoryId("");
    setTagFilters([]);
    setTagInput("");
  }

  // Auth + categories
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const id = sess.session?.user.id ?? null;

      if (!id) {
        setReady(true);
        setError("Not authenticated");
        return;
      }
      if (cancelled) return;

      setUid(id);

      const { data: catRows, error: cErr } = await supabase
        .from("categories")
        .select("id,name")
        .eq("writer_id", id)
        .order("name");

      if (!cancelled) {
        if (cErr) setError(cErr.message);
        setCats((catRows ?? []) as CategoryOpt[]);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Subcategories for chosen category
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!uid) return;

      if (!categoryId) {
        setSubs([]);
        setSubcategoryId("");
        return;
      }

      const { data, error: sErr } = await supabase
        .from("subcategories")
        .select("id,name,category_id")
        .eq("writer_id", uid)
        .eq("category_id", categoryId)
        .order("name");

      if (cancelled) return;

      if (sErr) {
        setError(sErr.message);
        return;
      }

      setSubs((data ?? []) as SubcategoryOpt[]);

      // keep subcategory consistent
      if (subcategoryId) {
        const ok = (data ?? []).some((s) => s.id === subcategoryId);
        if (!ok) setSubcategoryId("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, categoryId, subcategoryId, supabase]);

  async function fetchArticles() {
    if (!uid) return;

    setLoading(true);
    setError(null);

    try {
      // If tag filters exist, fetch candidate article IDs first (ANY-of-tags)
      let articleIdFilter: string[] | null = null;

      if (tagFilters.length) {
        const normalized = uniqueTags(tagFilters);

        const { data: tagRows, error: tErr } = await supabase
          .from("tags")
          .select("id,name")
          .eq("writer_id", uid)
          .in("name", normalized);

        if (tErr) throw tErr;

        const tagIds = (tagRows ?? []).map((t) => t.id);
        if (!tagIds.length) {
          setRows([]);
          return;
        }

        const { data: atRows, error: atErr } = await supabase
          .from("article_tags")
          .select("article_id")
          .in("tag_id", tagIds);

        if (atErr) throw atErr;

        const ids = Array.from(
          new Set((atRows ?? []).map((r) => r.article_id)),
        );
        articleIdFilter = ids.length ? ids : [];
        if (!articleIdFilter.length) {
          setRows([]);
          return;
        }
      }

      // Main query
      let query = supabase
        .from("articles")
        .select(
          "id,title,status,updated_at,last_saved_at,created_at,primary_image_url,categories(name),subcategories(name)",
        )
        .eq("writer_id", uid)
        .neq("status", "deleted")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (status) query = query.eq("status", status);
      if (categoryId) query = query.eq("category_id", categoryId);
      if (subcategoryId) query = query.eq("subcategory_id", subcategoryId);

      const qq = q.trim();
      if (qq) {
        // title/body search
        query = query.or(`title.ilike.%${qq}%,body_md.ilike.%${qq}%`);
      }

      if (articleIdFilter) query = query.in("id", articleIdFilter);

      const { data, error } = await query;
      if (error) throw error;

      const dbRows = (data ?? []) as unknown as ArticleRowDb[];

      const mapped: ArticleRow[] = dbRows.map((r) => ({
        id: r.id,
        title: r.title ?? "Untitled",
        status: r.status,
        updated_at: r.updated_at,
        last_saved_at: r.last_saved_at,
        created_at: r.created_at,
        category_name: r.categories?.[0]?.name ?? null,
        subcategory_name: r.subcategories?.[0]?.name ?? null,
      }));

      setRows(mapped);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Debounced refetch on filters
  useEffect(() => {
    if (!canFetch) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void fetchArticles();
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFetch, q, status, categoryId, subcategoryId, tagFilters.join("|")]);

  if (!ready) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-inner">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="page-title !mb-0">Your Articles</div>

          <LoadingLink
            href="/dashboard/write"
            className="btn-primary !w-auto flex items-center gap-2"
            loadingMode="append"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New draft
          </LoadingLink>
        </div>

        {error ? <p className="alert-error !mt-0">{error}</p> : null}

        {/* Filters */}
        <div className="mb-6 p-6 rounded-lg bg-slate-700/50 border border-slate-600/50 space-y-4 font-mono">
          <button
            type="button"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="w-full flex items-center justify-between hover:opacity-80 transition"
          >
            <div className="text-sm font-medium text-slate-200">
              Search & Filters
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-300">{filtersSummary}</div>
              <svg
                className={`w-5 h-5 text-slate-300 transition-transform ${
                  filtersExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {filtersExpanded ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="field-label">
                  <span className="text-slate-300">Search</span>
                  <input
                    className="field-input bg-slate-600/50 border-slate-500/50 text-slate-100"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Title or body…"
                  />
                </label>

                <label className="field-label">
                  <span className="text-slate-300">Status</span>
                  <select
                    className="field-input bg-slate-600/50 border-slate-500/50 text-slate-100"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "" | ArticleStatus)
                    }
                  >
                    <option value="">All</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                    <option value="archived">Archived</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </label>

                <label className="field-label">
                  <span className="text-slate-300">Category</span>
                  <select
                    className="field-input bg-slate-600/50 border-slate-500/50 text-slate-100"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">All</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="field-label">
                  <span className="text-slate-300">Subcategory</span>
                  <select
                    className="field-input bg-slate-600/50 border-slate-500/50 text-slate-100"
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    disabled={!categoryId}
                  >
                    <option value="">
                      {categoryId ? "All" : "Pick a category first"}
                    </option>
                    {subs.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <div className="field-label">
                    <span className="text-slate-300">Tag filter (optional)</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {tagFilters.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="btn-chip bg-slate-600/50 border-slate-500/50"
                        onClick={() => removeTagFilter(t)}
                        title="Remove"
                      >
                        #{t} <span className="text-slate-400">×</span>
                      </button>
                    ))}

                    <input
                      className="field-input !w-auto !py-2 bg-slate-600/50 border-slate-500/50 text-slate-100"
                      value={tagInput}
                      placeholder="Add tag… (Enter / comma)"
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const n = normalizeTag(tagInput);
                          if (n) addTagFilter(n);
                        }
                        if (
                          e.key === "Backspace" &&
                          !tagInput &&
                          tagFilters.length
                        ) {
                          e.preventDefault();
                          removeTagFilter(tagFilters[tagFilters.length - 1]);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-600/50">
                <div>
                  {loading ? "Loading…" : `${rows.length} shown (max 50)`}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn-ghost !py-1 text-slate-300 hover:text-slate-100"
                    type="button"
                    onClick={clearAll}
                  >
                    Clear
                  </button>
                  <button
                    className="btn-ghost !py-1 text-slate-300 hover:text-slate-100"
                    onClick={() => void fetchArticles()}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* List */}
        <div className="space-y-3">
          {!loading && rows.length === 0 ? (
            <div className="card-dashboard">
              <div className="text-slate-200 font-medium">No results</div>
              <div className="text-sm text-slate-400 mt-1">
                Try clearing filters or creating a new draft.
              </div>
            </div>
          ) : null}

          {rows.map((a) => (
            <div
              key={a.id}
              className={`card-dashboard hover:bg-slate-800/40 transition ${
                a.status === "published"
                  ? "border-2 border-green-500/50 dark:border-green-500/50"
                  : ""
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-lg font-semibold">
                      {a.title || "Untitled"}
                    </div>
                    {a.status === "published" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Published
                      </span>
                    ) : a.status === "draft" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Draft
                      </span>
                    ) : a.status === "unpublished" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                        Unpublished
                      </span>
                    ) : a.status === "archived" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                          />
                        </svg>
                        Archived
                      </span>
                    ) : a.status === "deleted" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Deleted
                      </span>
                    ) : null}
                  </div>

                  <div className="text-xs text-slate-400 mt-1">
                    {a.category_name ? (
                      <>
                        Category:{" "}
                        <span className="text-slate-200">
                          {a.category_name}
                        </span>
                      </>
                    ) : null}
                    {a.subcategory_name ? (
                      <>
                        {a.category_name ? " · " : ""}
                        Subcategory:{" "}
                        <span className="text-slate-200">
                          {a.subcategory_name}
                        </span>
                      </>
                    ) : null}
                  </div>

                  <div className="flex gap-2 mt-3 md:hidden">
                    <Link
                      className="btn-chip"
                      href={`/dashboard/write/${a.id}`}
                    >
                      Edit
                    </Link>

                    {a.status === "published" ? (
                      <Link className="btn-chip" href={`/articles/${a.id}`}>
                        View
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="hidden md:flex gap-2">
                  <Link
                    className="btn-chip"
                    href={`/dashboard/write/${a.id}`}
                  >
                    Edit
                  </Link>

                  {a.status === "published" ? (
                    <Link className="btn-chip" href={`/articles/${a.id}`}>
                      View
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Back Button */}
        <div className="fixed bottom-6 left-6 z-10">
          <BackButton />
        </div>
      </div>
    </main>
  );
}
