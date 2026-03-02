"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";

import { ArticleEditorHeader } from "./article-editor/ArticleEditorHeader";
import { ArticleMetadata } from "./article-editor/ArticleMetadata";
import { ArticleContentEditor } from "./article-editor/ArticleContentEditor";
import { ArticleDangerZone } from "./article-editor/ArticleDangerZone";
import { Toast } from "./article-editor/Toast";
import { ConfirmModal } from "./article-editor/ConfirmModal";
import { CelebrateBurst } from "./article-editor/CelebrateBurst";
import { useLocalTheme } from "./article-editor/useLocalTheme";

import {
  statusActionCopy,
  nowIso,
  uniqueTags,
  getErrorMessage,
  playSfx,
} from "./article-editor/utils";

import type {
  ArticleStatus,
  ToastState,
  ConfirmState,
  CategoryOpt,
  SubcategoryOpt,
  ArticleTagJoinRow,
} from "./article-editor/types";

async function syncTags(params: {
  supabase: ReturnType<typeof getSupabaseBrowserClient>;
  uid: string;
  articleId: string;
  tags: string[];
}) {
  const { supabase, uid, articleId } = params;
  const cleaned = uniqueTags(params.tags);

  const { data: tagRows, error: upsertErr } = await supabase
    .from("tags")
    .upsert(
      cleaned.map((name) => ({ writer_id: uid, name })),
      { onConflict: "writer_id,name" }
    )
    .select("id,name");

  if (upsertErr) throw upsertErr;

  const tagIds = (tagRows ?? []).map((t) => t.id);

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
  const [metadataExpanded, setMetadataExpanded] = useState(true);

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

  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [burst, setBurst] = useState<"publish" | "archive" | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  function showToast(next: ToastState) {
    setToast(next);
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 1800);
  }

  function triggerBurst(mode: "publish" | "archive" | null) {
    if (!mode) return;
    setBurst(mode);
    window.setTimeout(() => setBurst(null), 700);
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const dirtyRef = useRef(false);
  const savingRef = useRef(false);

  const needsMetadata = useMemo(() => {
    return (
      status === "published" ||
      status === "unpublished" ||
      status === "archived"
    );
  }, [status]);

  const hasRequiredMetadata = useMemo(() => {
    const hasMinTags = uniqueTags(tags).length >= 2;
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

  async function save(reason: "auto" | "manual" | "status", overrideStatus?: ArticleStatus): Promise<boolean> {
    if (!uid) return false;
    if (savingRef.current) return false;

    savingRef.current = true;
    setSaving(true);
    setError(null);

    try {
      // Use override status if provided, otherwise use current status
      const currentStatus = overrideStatus ?? status;
      const currentNeedsMetadata = 
        currentStatus === "published" ||
        currentStatus === "unpublished" ||
        currentStatus === "archived";

      if (currentNeedsMetadata && !hasRequiredMetadata) {
        throw new Error(
          "To publish/unpublish/archive you must select a category and have at least 2 tags."
        );
      }

      const payload: Record<string, unknown> = {
        title: title || "Untitled",
        body_md: body ?? "",
        status: currentStatus,
        category_id: categoryId || null,
        subcategory_id: subcategoryId || null,
        updated_at: nowIso(),
        last_saved_at: nowIso(),
      };

      if (currentStatus === "published")
        payload.published_at = publishedAt ?? nowIso();
      if (currentStatus === "unpublished")
        payload.unpublished_at = unpublishedAt ?? nowIso();
      if (currentStatus === "archived") payload.archived_at = archivedAt ?? nowIso();
      if (currentStatus === "deleted") payload.deleted_at = deletedAt ?? nowIso();

      // Sync tags BEFORE updating article (trigger checks tag count on update)
      const cleaned = await syncTags({
        supabase,
        uid,
        articleId,
        tags,
      });

      const { data: updated, error: upErr } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", articleId)
        .eq("writer_id", uid)
        .select()
        .single();

      if (upErr) throw upErr;

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
      return true;
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setError(msg);
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function deleteArticle() {
    if (!uid) return;
    if (deleting) return;

    const ok = window.confirm(
      "⚠️ PERMANENT WARNING\n\nYou are about to DELETE this article.\n\n• It will immediately disappear from your lists.\n• You will NOT be able to edit or restore it from the app.\n\nIf you understand, click OK to delete it."
    );

    if (!ok) return;

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

      router.replace("/dashboard/articles");
    } catch (e: unknown) {
      setError(getErrorMessage(e));
      setDeleting(false);
      savingRef.current = false;
    }
  }

  useEffect(() => {
    if (!blocked) return;

    const t = window.setTimeout(() => {
      router.replace("/dashboard/articles");
    }, 3000);

    return () => window.clearTimeout(t);
  }, [blocked, router]);

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

      const { data: catRows } = await supabase
        .from("categories")
        .select("id,name")
        .eq("writer_id", id)
        .order("name");

      if (cancelled) return;
      setCats((catRows ?? []) as CategoryOpt[]);

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
          "This article was deleted (or you don't have access). Redirecting…"
        );
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

      if (subcategoryId) {
        const ok = (data ?? []).some((s) => s.id === subcategoryId);
        if (!ok) setSubcategoryId("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, categoryId, subcategoryId, supabase]);

  useEffect(() => {
    if (blocked || deleting) return;

    const t = setInterval(() => {
      if (!dirtyRef.current) return;
      if (savingRef.current) return;
      void save("auto");
    }, 10_000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked, deleting, uid, status, categoryId, subcategoryId, title, body, tags]);

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
            <div className="page-title">Can&apos;t open this article</div>
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
      <div className="page-inner max-w-full p-2.5 md:p-6" data-color-mode={theme}>
        <Toast state={toast} />
        <CelebrateBurst mode={burst} />
        <ConfirmModal
          state={confirm}
          busy={saving || deleting}
          onCancel={() => setConfirm(null)}
          onConfirm={async (c) => {
            if (saving || deleting) return;

            const prev = status;
            setConfirm(null);

            setStatus(c.nextStatus);
            bumpStatusDatetime(c.nextStatus);
            markDirty();

            // Pass the new status directly to save to avoid stale state
            const ok = await save("status", c.nextStatus);
            if (!ok) {
              setStatus(prev);
              showToast({ message: "Couldn't change status", kind: "error" });
              return;
            }

            playSfx(c.sfx);
            triggerBurst(c.burst);
            showToast({ message: c.toast, kind: "success" });
          }}
        />

        <ArticleEditorHeader
          title={title}
          status={status}
          saveMsg={saveMsg}
          isDirty={dirtyRef.current}
          lastSavedAt={lastSavedAt}
          createdAt={createdAt}
          updatedAt={updatedAt}
          publishedAt={publishedAt}
          unpublishedAt={unpublishedAt}
          archivedAt={archivedAt}
          deletedAt={deletedAt}
          preview={preview}
          theme={theme}
          saving={saving}
          deleting={deleting}
          hasRequiredMetadata={hasRequiredMetadata}
          onTitleChange={(t) => {
            setTitle(t);
            markDirty();
          }}
          onPreviewToggle={() => setPreview((p) => !p)}
          onThemeToggle={toggleTheme}
          onStatusChange={(next) => {
            setError(null);
            const copy = statusActionCopy(status, next);
            setConfirm({
              open: true,
              title: copy.title,
              body: copy.body,
              confirmText: copy.confirmText,
              tone: copy.tone,
              nextStatus: next,
              sfx: copy.sfx,
              toast: copy.toast,
              burst: copy.burst,
            });
          }}
          onSave={() => void save("manual")}
          onError={setError}
        />

        {error ? (
          <p className="alert-error !mt-0">{error}</p>
        ) : needsMetadata && !hasRequiredMetadata ? (
          <p className="text-xs text-amber-300 mb-4">
            To publish/unpublish/archive/delete you must select a category and
            have <strong>at least 2 tags</strong>.
          </p>
        ) : null}

        {!preview && (
          <ArticleMetadata
            categoryId={categoryId}
            subcategoryId={subcategoryId}
            categories={cats}
            subcategories={subs}
            tags={tags}
            expanded={metadataExpanded}
            onToggle={() => setMetadataExpanded(!metadataExpanded)}
            onCategoryChange={(id) => {
              setCategoryId(id);
              markDirty();
            }}
            onSubcategoryChange={(id) => {
              setSubcategoryId(id);
              markDirty();
            }}
            onTagsChange={(t) => {
              setTags(t);
              markDirty();
            }}
          />
        )}

        <ArticleContentEditor
          body={body}
          preview={preview}
          tags={tags}
          onChange={(v) => {
            setBody(v);
            markDirty();
          }}
        />

        {!preview && (
          <ArticleDangerZone
            deleting={deleting}
            saving={saving}
            onDelete={deleteArticle}
          />
        )}
      </div>
    </main>
  );
}
