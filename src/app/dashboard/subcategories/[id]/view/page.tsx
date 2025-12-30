"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../../lib/supabaseClient";
import SubcategoryForm from "../../../../../components/SubcategoryForm";
import BackButton from "../../../../../components/BackButton";

const supabase = getSupabaseBrowserClient();

type Row = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: "active" | "inactive";
};

export default function EditSubcategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("id,category_id,name,description,image_url,status")
        .eq("id", params.id)
        .single();

      if (!mounted) return;

      if (error) setRow(null);
      else setRow(data as Row);

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [params.id]);

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
          <p className="text-sm text-slate-300">Subcategory not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-inner">
        <BackButton />
        <h1 className="page-title">Edit Subcategory</h1>
        <SubcategoryForm
          initial={row}
          submitLabel="Update"
          onSaved={() =>
            router.replace(`/dashboard/categories/${row.category_id}/view`)
          }
        />
        {row.image_url && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              Image preview
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.image_url}
              alt={row.name}
              className="h-40 w-full max-w-md rounded object-cover border border-slate-800"
            />
          </div>
        )}
      </div>
    </main>
  );
}
