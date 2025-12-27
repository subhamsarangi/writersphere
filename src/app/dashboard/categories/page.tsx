"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

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
      if (!uid) return setRows([]);
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

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) setRows((x) => x.filter((r) => r.id !== id));
  }

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

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link
          href="/dashboard/categories/new"
          className="rounded px-3 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900"
        >
          New Category
        </Link>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name or description…"
        className="mb-4 w-full max-w-md rounded border px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100"
      />

      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No categories yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border p-4 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{c.name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    c.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              {c.image_url && (
                /* eslint-disable @next/next/no-img-element */
                <img
                  src={c.image_url}
                  alt={c.name}
                  className="mt-2 h-28 w-full object-cover rounded"
                />
                /* eslint-enable @next/next/no-img-element */
              )}
              {c.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {c.description}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/dashboard/categories/${c.id}/edit`}
                  className="px-3 py-1 rounded border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Edit
                </Link>
                {/* ✅ Status quick toggle */}
                <button
                  onClick={() =>
                    toggleStatus(
                      c.id,
                      c.status === "active" ? "inactive" : "active"
                    )
                  }
                  className="px-3 py-1 rounded border text-sm hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-800 dark:hover:text-blue-100"
                  title={c.status === "active" ? "Set inactive" : "Set active"}
                >
                  {c.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => void handleDelete(c.id)}
                  className="px-3 py-1 rounded border text-sm hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-800 dark:hover:text-red-100"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
