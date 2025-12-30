"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "../lib/supabaseClient";

import MDEditor from "@uiw/react-md-editor";

type ArticleStatus =
  | "draft"
  | "published"
  | "unpublished"
  | "archived"
  | "deleted";

type CategoryOpt = { id: string; name: string };
type SubcategoryOpt = { id: string; name: string; category_id: string };
type ArticleTagJoinRow = {
  tags: { name: unknown }[] | { name: unknown } | null;
};

function nowIso() {
  return new Date().toISOString();
}

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

function formatTime(ts: string | null) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function getErrorMessage(e: unknown) {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  if (e instanceof Error) return e.message;
  return typeof e === "string" ? e : JSON.stringify(e);
}

function useLocalTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored =
      (typeof window !== "undefined" &&
        (localStorage.getItem("ws_theme") as "dark" | "light" | null)) ||
      null;

    const initial = stored ?? "dark";
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    // uiw uses data-color-mode
    document.documentElement.dataset.colorMode = theme;
    try {
      localStorage.setItem("ws_theme", theme);
    } catch {}
  }, [theme]);

  return {
    theme,
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  };
}

async function syncTags(params: {
  supabase: ReturnType<typeof getSupabaseBrowserClient>;
  uid: string;
  articleId: string;
  tags: string[];
}) {
  const { supabase, uid, articleId } = params;
  const cleaned = uniqueTags(params.tags);

  // Upsert tags, then attach via join table
  const { data: tagRows, error: upsertErr } = await supabase
    .from("tags")
    .upsert(
      cleaned.map((name) => ({ writer_id: uid, name })),
      { onConflict: "writer_id,name" }
    )
    .select("id,name");

  if (upsertErr) throw upsertErr;

  const tagIds = (tagRows ?? []).map((t) => t.id);

  // Replace join rows
  const { error: delErr } = await supabase
    .from("article_tags")
    .delete()
    .eq("article_id", articleId);

  if (delErr) throw delErr;

  if (tagIds.length) {
    const { error: insErr } = await supabase.from("article_tags").insert(
      tagIds.map((tag_id) => ({
        article_id: articleId,
        tag_id,
      }))
    );
    if (insErr) throw insErr;
  }

  return cleaned;
}

export default function ArticleEditor({ articleId }: { articleId: string }) {
  useEffect(() => {
    try {
      sessionStorage.removeItem("ws_newdraft_id");
    } catch {}
  }, []);

  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const { theme, toggle: toggleTheme } = useLocalTheme();
  const [preview, setPreview] = useState(false);

  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [cats, setCats] = useState<CategoryOpt[]>([]);
  const [subs, setSubs] = useState<SubcategoryOpt[]>([]);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [unpublishedAt, setUnpublishedAt] = useState<string | null>(null);
  const [archivedAt, setArchivedAt] = useState<string | null>(null);
  const [deletedAt, setDeletedAt] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirtyRef = useRef(false);
  const savingRef = useRef(false);

  const needsMetadata = useMemo(() => {
    // Only enforce requirements for these statuses
    return (
      status === "published" ||
      status === "unpublished" ||
      status === "archived"
    );
  }, [status]);

  const hasRequiredMetadata = useMemo(() => {
    const hasMinTags = uniqueTags(tags).length >= 5;
    const hasCategory = Boolean(categoryId);
    return hasMinTags && hasCategory;
  }, [tags, categoryId]);

  function markDirty() {
    dirtyRef.current = true;
    setSaveMsg(null);
  }

  function bumpStatusDatetime(next: ArticleStatus) {
    const ts = nowIso();
    if (next === "published") setPublishedAt(ts);
    if (next === "unpublished") setUnpublishedAt(ts);
    if (next === "archived") setArchivedAt(ts);
    if (next === "deleted") setDeletedAt(ts);
  }

  async function save(reason: "auto" | "manual" | "status") {
    if (!uid) return;
    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    setError(null);

    try {
      // If user picked a non-draft status, enforce required metadata
      if (needsMetadata && !hasRequiredMetadata) {
        throw new Error(
          "To publish/unpublish/archive you must select a category and have at least 5 tags."
        );
      }

      const payload: Record<string, unknown> = {
        title: title || "Untitled",
        body_md: body ?? "",
        status,
        category_id: categoryId || null,
        subcategory_id: subcategoryId || null,
        updated_at: nowIso(),
        last_saved_at: nowIso(),
      };

      // Keep status-related timestamps in sync
      if (status === "published")
        payload.published_at = publishedAt ?? nowIso();
      if (status === "unpublished")
        payload.unpublished_at = unpublishedAt ?? nowIso();
      if (status === "archived") payload.archived_at = archivedAt ?? nowIso();
      if (status === "deleted") payload.deleted_at = deletedAt ?? nowIso();

      const { data: updated, error: upErr } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", articleId)
        .eq("writer_id", uid)
        .select(
          "created_at,updated_at,last_saved_at,published_at,unpublished_at,archived_at,deleted_at"
        )
        .single();

      if (upErr) throw upErr;

      // Sync tags (best-effort; if this fails you’ll see the error)
      const cleaned = await syncTags({
        supabase,
        uid,
        articleId,
        tags,
      });

      setTags(cleaned);

      dirtyRef.current = false;
      setCreatedAt(updated?.created_at ?? createdAt);
      setUpdatedAt(updated?.updated_at ?? null);
      setLastSavedAt(updated?.last_saved_at ?? null);
      setPublishedAt(updated?.published_at ?? null);
      setUnpublishedAt(updated?.unpublished_at ?? null);
      setArchivedAt(updated?.archived_at ?? null);
      setDeletedAt(updated?.deleted_at ?? null);

      setSaveMsg(
        reason === "auto"
          ? "Autosaved"
          : reason === "status"
          ? "Status saved"
          : "Saved"
      );
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setError(msg);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }
  // delete handler (confirmation + delete + immediate redirect)
  async function deleteArticle() {
    if (!uid) return;
    if (deleting) return;

    const ok = window.confirm(
      "⚠️ PERMANENT WARNING\n\nYou are about to DELETE this article.\n\n• It will immediately disappear from your lists.\n• You will NOT be able to edit or restore it from the app.\n\nIf you understand, click OK to delete it."
    );

    if (!ok) return;

    // Prevent autosave / double-actions while deletion is in progress
    savingRef.current = true;
    setDeleting(true);
    setError(null);

    try {
      const ts = nowIso();
      const { error: delErr } = await supabase
        .from("articles")
        .update({
          status: "deleted",
          deleted_at: ts,
          updated_at: ts,
          last_saved_at: ts,
        })
        .eq("id", articleId)
        .eq("writer_id", uid);

      if (delErr) throw delErr;

      // Immediate redirect
      router.replace("/dashboard/articles");
    } catch (e: unknown) {
      setError(getErrorMessage(e));
      setDeleting(false);
      savingRef.current = false;
    }
  }

  // Redirect after 3s when blocked
  useEffect(() => {
    if (!blocked) return;

    const t = window.setTimeout(() => {
      router.replace("/dashboard/articles");
    }, 3000);

    return () => window.clearTimeout(t);
  }, [blocked, router]);

  // Load session + article + metadata
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const id = sess.session?.user.id ?? null;
      if (!id) {
        setError("Not authenticated");
        setReady(true);
        return;
      }

      if (cancelled) return;
      setUid(id);

      // Load categories (writer-owned)
      const { data: catRows } = await supabase
        .from("categories")
        .select("id,name")
        .eq("writer_id", id)
        .order("name");

      if (cancelled) return;
      setCats((catRows ?? []) as CategoryOpt[]);

      // Load article
      const { data: a, error: aErr } = await supabase
        .from("articles")
        .select(
          "title,body_md,status,category_id,subcategory_id,created_at,updated_at,last_saved_at,published_at,unpublished_at,archived_at,deleted_at"
        )
        .eq("id", articleId)
        .eq("writer_id", id)
        .single();

      if (aErr || !a || a.status === "deleted") {
        setError(
          "This article was deleted (or you don’t have access). Redirecting…"
        );
        setBlocked(true);
        setReady(true);
        return;
      }

      if (a.status === "deleted") {
        setError("This article was deleted. Redirecting…");
        setBlocked(true);
        setReady(true);
        return;
      }

      if (cancelled) return;

      setTitle(a.title ?? "");
      setBody(a.body_md ?? "");
      setStatus((a.status ?? "draft") as ArticleStatus);
      setCategoryId(a.category_id ?? "");
      setSubcategoryId(a.subcategory_id ?? "");

      setCreatedAt(a.created_at ?? null);
      setUpdatedAt(a.updated_at ?? null);
      setLastSavedAt(a.last_saved_at ?? null);
      setPublishedAt(a.published_at ?? null);
      setUnpublishedAt(a.unpublished_at ?? null);
      setArchivedAt(a.archived_at ?? null);
      setDeletedAt(a.deleted_at ?? null);

      // Load tags via join
      const { data: joined, error: tErr } = await supabase
        .from("article_tags")
        .select("tags(name)")
        .eq("article_id", articleId);

      if (!tErr && joined) {
        const rows = joined as unknown as ArticleTagJoinRow[];

        const names = rows
          .flatMap((row) => {
            const t = row.tags;
            if (!t) return [];
            const arr = Array.isArray(t) ? t : [t];
            return arr.map((x) => x.name);
          })
          .filter(
            (n): n is string => typeof n === "string" && n.trim().length > 0
          );

        setTags(uniqueTags(names));
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [articleId, supabase]);

  // Load subcategories when category changes
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

      // If existing subcategory doesn't match new category, clear it
      if (subcategoryId) {
        const ok = (data ?? []).some((s) => s.id === subcategoryId);
        if (!ok) setSubcategoryId("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, categoryId, subcategoryId, supabase]);

  // Autosave every 10 seconds if dirty
  useEffect(() => {
    if (blocked || deleting) return;

    const t = setInterval(() => {
      if (!dirtyRef.current) return;
      if (savingRef.current) return;
      void save("auto");
    }, 10_000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    blocked,
    deleting,
    uid,
    status,
    categoryId,
    subcategoryId,
    title,
    body,
    tags,
  ]);

  function addTag(raw: string) {
    const n = normalizeTag(raw);
    if (!n) return;
    const next = uniqueTags([...tags, n]);
    setTags(next);
    setTagInput("");
    markDirty();
  }

  function removeTag(name: string) {
    const key = name.toLowerCase();
    setTags((t) => t.filter((x) => x.toLowerCase() !== key));
    markDirty();
  }

  if (!ready) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  if (blocked) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <div className="card-dashboard w-full max-w-xl">
            <div className="page-title">Can’t open this article</div>
            <p className="text-sm text-slate-300 mt-2">
              {error ?? "This article is not available."}
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Redirecting to your articles list in 3 seconds…
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-inner" data-color-mode={theme}>
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="page-title">Write</div>
            <div className="page-subtitle">
              {saveMsg ? (
                <span className="text-emerald-300">{saveMsg}</span>
              ) : dirtyRef.current ? (
                <span className="text-amber-300">Unsaved changes</span>
              ) : (
                <span className="text-slate-400">Up to date</span>
              )}
              {lastSavedAt ? (
                <span className="ml-2 text-slate-500">
                  · Last saved: {formatTime(lastSavedAt)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn-ghost"
              type="button"
              onClick={() => setPreview((p) => !p)}
            >
              {preview ? "Edit" : "Preview"}
            </button>

            <button className="btn-ghost" type="button" onClick={toggleTheme}>
              Theme: {theme === "dark" ? "Dark" : "Light"}
            </button>

            <select
              className="field-input !w-auto !py-1.5"
              value={status}
              disabled={saving || deleting}
              onChange={(e) => {
                const next = e.target.value as ArticleStatus;

                // optimistic guard for UX; DB trigger is the final gate too
                const nextNeedsMetadata =
                  next === "published" ||
                  next === "unpublished" ||
                  next === "archived";

                if (nextNeedsMetadata && !hasRequiredMetadata) {
                  setError(
                    "Pick a category and add at least 5 tags before publishing/unpublishing/archiving."
                  );
                  return;
                }

                setError(null);
                setStatus(next);
                bumpStatusDatetime(next);
                markDirty();
                void save("status");
              }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
              <option value="archived">Archived</option>
            </select>

            <button
              className="btn-primary !w-auto"
              type="button"
              disabled={saving}
              onClick={() => void save("manual")}
            >
              {saving ? "Saving…" : "Save now"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="alert-error !mt-0">{error}</p>
        ) : needsMetadata && !hasRequiredMetadata ? (
          <p className="text-xs text-amber-300 mb-4">
            To publish/unpublish/archive/delete you must select a category and
            have <strong>at least 5 tags</strong>.
          </p>
        ) : null}

        {/* Meta */}
        <div className="card-dashboard mb-6 space-y-4">
          <label className="field-label">
            <span>Title</span>
            <input
              className="field-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
              placeholder="Untitled"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="field-label">
              <span>Category (required to publish)</span>
              <select
                className="field-input"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  markDirty();
                }}
              >
                <option value="">Select a category</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              <span>Subcategory (optional)</span>
              <select
                className="field-input"
                value={subcategoryId}
                onChange={(e) => {
                  setSubcategoryId(e.target.value);
                  markDirty();
                }}
                disabled={!categoryId}
              >
                <option value="">
                  {categoryId
                    ? "Select a subcategory"
                    : "Pick a category first"}
                </option>
                {subs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="field-label">
                <span>Tags (min 5)</span>
              </div>
              <div className="text-xs text-slate-400">
                {uniqueTags(tags).length}/5
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {uniqueTags(tags).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="btn-chip"
                  onClick={() => removeTag(t)}
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
                    addTag(tagInput);
                  }
                  if (e.key === "Backspace" && !tagInput && tags.length) {
                    e.preventDefault();
                    removeTag(tags[tags.length - 1]);
                  }
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Tip: press <strong>Enter</strong> or type a <strong>,</strong> to
              add. Click a tag to remove.
            </p>
          </div>

          {/* Important datetimes */}
          <div className="text-xs text-slate-400 grid grid-cols-1 gap-1 sm:grid-cols-2">
            <div>Created: {formatTime(createdAt)}</div>
            <div>Updated: {formatTime(updatedAt)}</div>
            <div>Published: {formatTime(publishedAt)}</div>
            <div>Unpublished: {formatTime(unpublishedAt)}</div>
            <div>Archived: {formatTime(archivedAt)}</div>
            <div>Deleted: {formatTime(deletedAt)}</div>
          </div>
        </div>

        {/* Editor */}
        <div className="card-dashboard">
          {preview ? (
            <div className="prose max-w-none">
              <MDEditor.Markdown source={body || ""} />
            </div>
          ) : (
            <MDEditor
              value={body}
              onChange={(v) => {
                setBody(v ?? "");
                markDirty();
              }}
              height={520}
              textareaProps={{ placeholder: "Write in Markdown…" }}
            />
          )}
        </div>

        {/* Danger zone */}
        <div className="card-dashboard mt-6 border border-red-900/60 bg-black/40">
          <div className="text-red-200 font-semibold">Danger zone</div>
          <p className="text-sm text-slate-300 mt-2">
            Deleting this article will remove it from your lists and block any
            further edits.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            This action is intended to be permanent in the app.
          </p>

          <button
            type="button"
            disabled={deleting || saving}
            onClick={() => void deleteArticle()}
            className="mt-4 btn-ghost !w-full sm:!w-auto !border-red-800 !text-red-200 hover:!bg-red-950/50 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete article"}
          </button>
        </div>
      </div>
    </main>
  );
}
