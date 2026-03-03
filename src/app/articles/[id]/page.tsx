"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import MDEditor from "@uiw/react-md-editor";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";
import Footer from "../../../components/Footer";

type PublishedArticleWithAuthor = {
  id: string;
  title: string | null;
  body_md: string | null;
  published_at: string | null;
  updated_at: string | null;
  author_name: string | null;
  tags: string[] | null;
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
    "author_name" in o &&
    "tags" in o
  );
}

export default function PublishedArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<PublishedArticleWithAuthor | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load theme from localStorage (only for this page)
  useEffect(() => {
    const stored =
      (typeof window !== "undefined" &&
        (localStorage.getItem("ws_article_theme") as "dark" | "light" | null)) ||
      null;
    const initial = stored ?? "dark";
    setTheme(initial);
  }, []);

  // Save theme preference (only for article view)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("ws_article_theme", theme);
    } catch {}
  }, [theme]);

  // Apply theme to entire page
  useEffect(() => {
    if (typeof document === "undefined") return;
    const originalTheme = document.documentElement.dataset.theme;
    const originalColorMode = document.documentElement.dataset.colorMode;
    
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.colorMode = theme;
    
    // Restore original theme when component unmounts
    return () => {
      if (originalTheme) document.documentElement.dataset.theme = originalTheme;
      if (originalColorMode) document.documentElement.dataset.colorMode = originalColorMode;
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      const res = await supabase.rpc("get_published_article_with_author", {
        p_id: id,
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
      
      // Tags are now included in the function response
      const tagArray = first.tags || [];
      setTags(Array.isArray(tagArray) ? tagArray : []);

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

  if (loading) {
    return (
      <>
      <main className="page-shell">
        <div className="page-center">
          <div className="skeleton-card" />
        </div>
      </main>
      <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
      <main className="page-shell">
        <div className="page-center">
          <div className="card-dashboard w-full max-w-xl">
            <div className="page-title">Couldn&apos;t load article</div>
            <p className="text-sm text-red-300 mt-2">{error}</p>
            <Link className="btn-chip mt-4 inline-flex" href="/">
              Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      </>
    );
  }

  if (!row) {
    return (
      <>
      <main className="page-shell">
        <div className="page-center">
          <div className="card-dashboard w-full max-w-xl">
            <div className="page-title">Not found</div>
            <p className="text-sm text-slate-300 mt-2">
              This article doesn&apos;t exist or isn&apos;t published.
            </p>
            <Link className="btn-chip mt-4 inline-flex" href="/">
              Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      </>
    );
  }

  const author = row.author_name?.trim() ? row.author_name : "Anonymous";
  const hasPoetryTag = tags.some(tag => tag.toLowerCase() === 'poetry');

  return (
    <>
    <main className="page-shell">
      <div 
        className="page-inner max-w-3xl p-2" 
        data-color-mode={theme}
      >
        {/* Theme toggle button */}
        <div className="flex justify-end mb-4">
          <button className="btn-ghost" type="button" onClick={toggleTheme}>
            {theme === "dark" ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                  />
                </svg>
                Dark
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  />
                </svg>
                Light
              </>
            )}
          </button>
        </div>

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

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isPoetry = tag.toLowerCase() === 'poetry';
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isPoetry
                        ? 'poetry-tag bg-purple-900/40 text-purple-200 border border-purple-700/60 shadow-sm shadow-purple-500/20'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    #{tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className={`prose-container ${hasPoetryTag ? 'poetry-content' : ''}`}>
          <div className="prose max-w-none">
            <MDEditor.Markdown className="p-2" source={row.body_md ?? ""} />
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
