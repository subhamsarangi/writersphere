"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../../../../lib/supabaseClient";
import CategoryForm from "../../../../../components/CategoryForm";

const supabase = getSupabaseBrowserClient();

type Row = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: "active" | "inactive";
};

type SubRow = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: "active" | "inactive";
  created_at: string;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [row, setRow] = useState<Row | null>(null);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [subSearch, setSubSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      const [catRes, subRes] = await Promise.all([
        supabase
          .from("categories")
          .select("id,name,description,image_url,status")
          .eq("id", params.id)
          .single(),
        supabase
          .from("subcategories")
          .select("id,category_id,name,description,image_url,status,created_at")
          .eq("category_id", params.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;

      if (catRes.error) {
        setRow(null);
      } else {
        setRow(catRes.data as Row);
      }

      if (subRes.error) {
        setSubs([]);
      } else {
        setSubs((subRes.data ?? []) as SubRow[]);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [params.id]);

  const filteredSubs = useMemo(() => {
    if (!subSearch.trim()) return subs;
    const qq = subSearch.toLowerCase();
    return subs.filter(
      (s) =>
        s.name.toLowerCase().includes(qq) ||
        (s.description ?? "").toLowerCase().includes(qq)
    );
  }, [subs, subSearch]);

  async function handleDeleteSub(id: string) {
    if (!confirm("Delete this subcategory? This cannot be undone.")) return;
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", id);
    if (!error) {
      setSubs((xs) => xs.filter((s) => s.id !== id));
    }
  }

  async function toggleSubStatus(id: string, next: "active" | "inactive") {
    setSubs((xs) => xs.map((s) => (s.id === id ? { ...s, status: next } : s)));

    const { error } = await supabase
      .from("subcategories")
      .update({ status: next })
      .eq("id", id);

    if (error) {
      setSubs((xs) =>
        xs.map((s) =>
          s.id === id
            ? { ...s, status: next === "active" ? "inactive" : "active" }
            : s
        )
      );
      alert(error.message);
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  if (!row) {
    return (
      <main className="page-shell">
        <div className="page-center">
          <p className="text-sm text-slate-300">Category not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-inner space-y-8">
        {/* Category form */}
        <section>
          <h1 className="page-title">Edit Category</h1>
          <CategoryForm
            initial={row}
            submitLabel="Update"
            onSaved={() => router.replace("/dashboard/categories")}
          />
        </section>

        {/* Subcategories list for this category */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Subcategories</h2>

            <div className="flex items-center gap-2">
              <input
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="Filter subcategories…"
                className="field-input max-w-xs"
              />

              {/* Assumes you have a "new subcategory" page that can read the category from query string */}
              <Link
                href={`/dashboard/subcategories/new?category=${row.id}`}
                className="btn-primary w-fit text-xs"
              >
                New Subcategory
              </Link>
            </div>
          </div>

          {filteredSubs.length === 0 ? (
            <p className="text-sm text-slate-400">
              No subcategories for this category yet.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSubs.map((s) => (
                <li key={s.id} className="card-dashboard">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{s.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        s.status === "active"
                          ? "bg-emerald-900/70 text-emerald-200"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {s.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.image_url}
                      alt={s.name}
                      className="mt-2 h-24 w-full rounded object-cover"
                    />
                  )}

                  {s.description && (
                    <p className="mt-2 text-sm text-slate-300 line-clamp-3">
                      {s.description}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/dashboard/subcategories/${s.id}/edit`}
                      className="btn-chip text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        toggleSubStatus(
                          s.id,
                          s.status === "active" ? "inactive" : "active"
                        )
                      }
                      className="btn-chip text-sm text-emerald-300"
                      title={
                        s.status === "active" ? "Set inactive" : "Set active"
                      }
                    >
                      {s.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => void handleDeleteSub(s.id)}
                      className="btn-chip text-sm text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
