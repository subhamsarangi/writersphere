"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MDEditor from "@uiw/react-md-editor";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";

type PublishedArticle = {
  id: string;
  title: string | null;
  body_md: string | null;
  published_at: string | null;
  updated_at: string | null;
};

function fmt(ts: string | null) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function PublishedArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<PublishedArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("articles")
        .select("id,title,body_md,published_at,updated_at,status")
        .eq("id", params.id)
        .eq("status", "published")
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setRow(null);
        setLoading(false);
        return;
      }

      // strip status field
      const { id, title, body_md, published_at, updated_at } =
        data as PublishedArticle & { status: string };

      setRow({ id, title, body_md, published_at, updated_at });
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

  return (
    <main className="page-shell">
      <div className="page-inner max-w-3xl">
        <div className="mb-6">
          <div className="text-3xl font-bold">
            {row.title?.trim() ? row.title : "Untitled"}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Published: {fmt(row.published_at)}{" "}
            {row.updated_at ? `· Updated: ${fmt(row.updated_at)}` : ""}
          </div>
        </div>

        <div className="card-dashboard">
          <div className="prose max-w-none">
            <MDEditor.Markdown source={row.body_md ?? ""} />
          </div>
        </div>
      </div>
    </main>
  );
}
