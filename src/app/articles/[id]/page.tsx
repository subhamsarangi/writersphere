"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import MDEditor from "@uiw/react-md-editor";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";
import Footer from "../../../components/Footer";

type PublishedArticleWithAuthor = {
  id: string;
  title: string | null;
  body_md: string | null;
  primary_image_url: string | null;
  category_name: string | null;
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
    "primary_image_url" in o &&
    "category_name" in o &&
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
  const hasPoetryTag = tags.some(tag => ['poetry', 'poem', 'poems', 'poet'].includes(tag.toLowerCase()));
  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
  const ogImage = row.primary_image_url || '/og-image.png';
  const description = row.body_md?.slice(0, 160) || 'Read this article on Writersphere';

  return (
    <>
    <Head>
      <title>{row.title || 'Article'} - Writersphere</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={row.title || 'Article'} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={articleUrl} />
      {row.published_at && <meta property="article:published_time" content={row.published_at} />}
      {row.updated_at && <meta property="article:modified_time" content={row.updated_at} />}
      {row.author_name && <meta property="article:author" content={row.author_name} />}
      {tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={row.title || 'Article'} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Head>
    <main className="page-shell">
      <div data-color-mode={theme}>
        {/* Header with Image and Title - Full Width */}
        <div className="w-full mb-8 bg-slate-800/30 [html[data-theme='light']_&]:bg-slate-100">
          {/* Mobile: Image full width, Desktop: Constrained with flex layout */}
          <div className="lg:max-w-6xl lg:mx-auto" style={{ maxWidth: '100vw' }}>
            <div className="flex flex-col lg:flex-row lg:gap-6 items-start" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>
              {/* Image - touches edges on mobile, 40% on desktop */}
              {row.primary_image_url && (
                <div className="w-full lg:w-[40%] flex-shrink-0">
                  <div className="relative w-full aspect-video bg-slate-700/30 [html[data-theme='light']_&]:bg-slate-200">
                    <Image
                      src={row.primary_image_url}
                      alt={row.title || "Article"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {/* Title and Metadata - 60% width on desktop */}
              <div className="flex-1 flex flex-col justify-between min-h-[240px] px-4 lg:px-0 py-8" style={{ height: 'stretch' }}>
                {/* Theme toggle above content */}
                <div className="flex justify-end mb-4">
                  <button 
                    className="px-3 py-1.5 text-xs rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition border border-slate-600 [html[data-theme='light']_&]:bg-slate-200 [html[data-theme='light']_&]:hover:bg-slate-300 [html[data-theme='light']_&]:text-slate-700 [html[data-theme='light']_&]:border-slate-300" 
                    type="button" 
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? (
                      <span className="flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                          />
                        </svg>
                        Dark
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                          />
                        </svg>
                        Light
                      </span>
                    )}
                  </button>
                </div>

                {/* Category at top edge */}
                <div className="mb-4">
                {row.category_name && (
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 [html[data-theme='light']_&]:bg-blue-100 [html[data-theme='light']_&]:text-blue-700 [html[data-theme='light']_&]:border-blue-300">
                    {row.category_name}
                  </span>
                )}
              </div>

              {/* Title in the middle - centered vertically */}
              <div className="flex-1 flex items-center">
                <h1 className="text-3xl font-bold lg:font-normal text-slate-100 [html[data-theme='light']_&]:text-slate-900 leading-tight" style={{ fontSize: 'clamp(1.875rem, 5vw, 4rem)' }}>
                  {row.title?.trim() ? row.title : "Untitled"}
                </h1>
              </div>

              {/* Author and time at bottom edge */}
              <div className="text-sm text-slate-400 mt-4 flex flex-wrap gap-x-2 gap-y-1 [html[data-theme='light']_&]:text-slate-600">
                <span className="font-medium">By {author}</span>
                <span className="text-slate-500 [html[data-theme='light']_&]:text-slate-400">·</span>
                <span>Published: {fmt(row.published_at)}</span>
                {row.updated_at ? (
                  <>
                    <span className="text-slate-500 [html[data-theme='light']_&]:text-slate-400">·</span>
                    <span>Updated: {fmt(row.updated_at)}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Tags below the header - constrained on desktop */}
          <div className="lg:max-w-6xl lg:mx-auto" style={{ maxWidth: '100vw' }}>
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 px-4">
                {tags.map((tag) => {
                const isPoetry = tag.toLowerCase() === 'poetry';
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isPoetry
                        ? 'poetry-tag bg-purple-900/40 text-purple-200 border border-purple-700/60 shadow-sm shadow-purple-500/20 [html[data-theme=\'light\']_&]:bg-purple-100 [html[data-theme=\'light\']_&]:text-purple-700 [html[data-theme=\'light\']_&]:border-purple-300'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 [html[data-theme=\'light\']_&]:bg-slate-100 [html[data-theme=\'light\']_&]:text-slate-700 [html[data-theme=\'light\']_&]:border-slate-300'
                    }`}
                  >
                    #{tag}
                  </span>
                );
              })}
            </div>
          )}
          </div>
        </div>

        {/* Content Area - Constrained Width */}
        <div className="max-w-3xl mx-auto px-4">
          <div className={`prose-container mt-16 mb-24 ${hasPoetryTag ? 'poetry-content' : ''}`}>
            {hasPoetryTag ? (
              <div className="poetry-preview px-2 py-1">
                {(row.body_md ?? "").split(/\n\n+/).map((stanza, i) => (
                  <p key={i} style={{ whiteSpace: 'pre-line', marginBottom: '1.2em', marginTop: 0 }}>
                    {stanza.trim()}
                  </p>
                ))}
              </div>
            ) : (
              <div className="prose max-w-none">
                <MDEditor.Markdown className="p-2" source={row.body_md ?? ""} />
              </div>
            )}
          </div>
        </div>

        {/* Social Sharing Buttons */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full px-4 py-3 shadow-xl">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${row.title || 'Check out this article'} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 transition-colors"
              title="Share on WhatsApp"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors"
              title="Share on LinkedIn"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(row.title || 'Check out this article')}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              title="Share on X"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent(row.title || 'Check out this article')}&body=${encodeURIComponent(`${row.title || 'Check out this article'}\n\n${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
              style={{ background: theme === 'light' ? '#475569' : '#334155' }}
              title="Share via Email"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>

            {/* Reddit */}
            <a
              href={`https://reddit.com/submit?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(row.title || 'Check out this article')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-500 transition-colors"
              title="Share on Reddit"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </a>
          </div>
        </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
