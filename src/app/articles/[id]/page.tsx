"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MDEditor from "@uiw/react-md-editor";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";

type PublishedArticleWithAuthor = {
  id: string;
  title: string | null;
  body_md: string | null;
  published_at: string | null;
  updated_at: string | null;
  author_name: string | null;
};

function fmt(ts: string | null) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function isRow(v: unknown): v is PublishedArticleWithAuthor {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    "title" in o &&
    "body_md" in o &&
    "published_at" in o &&
    "updated_at" in o &&
    "author_name" in o
  );
}

export default function PublishedArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<PublishedArticleWithAuthor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      const res = await supabase.rpc("get_published_article_with_author", {
        p_id: params.id,
      });

      if (cancelled) return;

      if (res.error) {
        setError(res.error.message);
        setLoading(false);
        return;
      }

      // SQL function returns an array (table result). Take first row.
      const dataUnknown: unknown = res.data;
      const first =
        Array.isArray(dataUnknown) && dataUnknown.length > 0
          ? dataUnknown[0]
          : null;

      if (!first || !isRow(first)) {
        setRow(null);
        setLoading(false);
        return;
      }

      setRow(first);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [params.id, supabase]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <div className="card-dashboard w-full max-w-xl">
            <div className="page-title">Couldn’t load article</div>
            <p className="text-sm text-red-300 mt-2">{error}</p>
            <Link className="btn-chip mt-4 inline-flex" href="/">
              Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!row) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <div className="card-dashboard w-full max-w-xl">
            <div className="page-title">Not found</div>
            <p className="text-sm text-slate-300 mt-2">
              This article doesn’t exist or isn’t published.
            </p>
            <Link className="btn-chip mt-4 inline-flex" href="/">
              Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const author = row.author_name?.trim() ? row.author_name : "Anonymous";

  return (
    <main className="page-shell">
      <div className="page-inner max-w-3xl p-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {row.title?.trim() ? row.title : "Untitled"}
          </h1>

          <div className="text-xs text-slate-400 mt-2 flex flex-wrap gap-x-2 gap-y-1">
            <span>By {author}</span>
            <span className="text-slate-500">·</span>
            <span>Published: {fmt(row.published_at)}</span>
            {row.updated_at ? (
              <>
                <span className="text-slate-500">·</span>
                <span>Updated: {fmt(row.updated_at)}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="prose-container">
          <div className="prose max-w-none">
            <MDEditor.Markdown className="p-2" source={row.body_md ?? ""} />
          </div>
        </div>
      </div>
    </main>
  );
}
