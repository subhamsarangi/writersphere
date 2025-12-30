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
          new Set((atRows ?? []).map((r) => r.article_id))
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
          "id,title,status,updated_at,last_saved_at,created_at,categories(name),subcategories(name)"
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
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <div className="page-title !mb-0">Your Articles</div>
              <div className="text-xs text-slate-400">{filtersSummary}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LoadingLink
              href="/dashboard/write"
              className="btn-primary !w-auto"
              loadingMode="append"
            >
              New draft
            </LoadingLink>

            <button className="btn-ghost" type="button" onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>

        {error ? <p className="alert-error !mt-0">{error}</p> : null}

        {/* Filters */}
        <div className="card-dashboard mb-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="field-label">
              <span>Search</span>
              <input
                className="field-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Title or body…"
              />
            </label>

            <label className="field-label">
              <span>Status</span>
              <select
                className="field-input"
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
              <span>Category</span>
              <select
                className="field-input"
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
              <span>Subcategory</span>
              <select
                className="field-input"
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
                <span>Tag filter (optional)</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {tagFilters.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="btn-chip"
                    onClick={() => removeTagFilter(t)}
                    title="Remove"
                  >
                    #{t} <span className="text-slate-400">×</span>
                  </button>
                ))}

                <input
                  className="field-input !w-auto !py-2"
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

          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>{loading ? "Loading…" : `${rows.length} shown (max 50)`}</div>
            <button
              className="btn-ghost !py-1"
              onClick={() => void fetchArticles()}
            >
              Refresh
            </button>
          </div>
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
            <Link
              key={a.id}
              href={`/dashboard/write/${a.id}`}
              className="card-dashboard block hover:bg-slate-800/40 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">
                    {a.title || "Untitled"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Status: <span className="text-slate-200">{a.status}</span>
                    {a.category_name ? (
                      <>
                        {" "}
                        · Category:{" "}
                        <span className="text-slate-200">
                          {a.category_name}
                        </span>
                      </>
                    ) : null}
                    {a.subcategory_name ? (
                      <>
                        {" "}
                        · Subcategory:{" "}
                        <span className="text-slate-200">
                          {a.subcategory_name}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <div>Updated: {fmt(a.updated_at)}</div>
                  <div>Saved: {fmt(a.last_saved_at)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
