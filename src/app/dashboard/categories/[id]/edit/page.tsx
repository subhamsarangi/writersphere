"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id,name,description,image_url,status")
        .eq("id", params.id)
        .single();
      if (!mounted) return;
      if (error) setRow(null);
      else setRow(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  if (loading) return <main className="p-6">Loading…</main>;
  if (!row) return <main className="p-6">Not found</main>;

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>
      <CategoryForm
        initial={row}
        submitLabel="Update"
        onSaved={() => router.replace("/dashboard/categories")}
      />
    </main>
  );
}
