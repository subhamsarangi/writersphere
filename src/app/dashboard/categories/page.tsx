"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";
import LoadingLink from "../../../components/LoadingLink";

const supabase = getSupabaseBrowserClient();

type Row = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: "active" | "inactive";
  created_at: string;
};

export default function CategoriesListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) {
        if (mounted) setRows([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .select("id,name,description,image_url,status,created_at")
        .eq("writer_id", uid)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setRows([]);
      } else {
        setRows(data ?? []);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const qq = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(qq) ||
        (r.description ?? "").toLowerCase().includes(qq)
    );
  }, [rows, q]);

  async function toggleStatus(id: string, next: "active" | "inactive") {
    // optimistic UI update
    setRows((xs) => xs.map((x) => (x.id === id ? { ...x, status: next } : x)));

    const { error } = await supabase
      .from("categories")
      .update({ status: next })
      .eq("id", id);

    if (error) {
      // revert on error
      setRows((xs) =>
        xs.map((x) =>
          x.id === id
            ? { ...x, status: next === "active" ? "inactive" : "active" }
            : x
        )
      );
      alert(error.message);
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-inner">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="skeleton-card h-40" />
            <div className="skeleton-card h-40" />
            <div className="skeleton-card h-40" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-inner">
        <div className="flex items-center justify-between mb-4">
          <h1 className="page-title">Categories</h1>
          <LoadingLink
            href="/dashboard/categories/new"
            className="btn-primary w-fit"
            loadingMode="overlay"
          >
            New Category
          </LoadingLink>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or description…"
          className="field-input max-w-md mb-4"
        />

        {loading ? (
          <p className="text-sm text-slate-300">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400">No categories yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <li key={c.id} className="card-dashboard">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{c.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      c.status === "active"
                        ? "bg-emerald-900/70 text-emerald-200"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {c.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="mt-2 h-28 w-full rounded object-cover"
                  />
                )}

                {c.description && (
                  <p className="mt-2 text-sm text-slate-300 line-clamp-3">
                    {c.description}
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  <LoadingLink
                    href={`/dashboard/categories/${c.id}/view`}
                    className="btn-chip"
                    loadingMode="replace"
                    loadingText="loading"
                  >
                    View
                  </LoadingLink>

                  <button
                    onClick={() =>
                      toggleStatus(
                        c.id,
                        c.status === "active" ? "inactive" : "active"
                      )
                    }
                    className="btn-chip text-emerald-300"
                    title={
                      c.status === "active" ? "Set inactive" : "Set active"
                    }
                  >
                    {c.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
