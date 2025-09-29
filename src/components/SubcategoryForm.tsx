"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Status = "active" | "inactive";
export type SubcategoryInput = {
  category_id: string;
  name: string;
  description?: string;
  image_url?: string;
  status: Status;
};

export default function SubcategoryForm({
  initial,
  onSaved,
  submitLabel = "Save",
}: {
  initial?: Partial<SubcategoryInput> & { id?: string };
  onSaved: (id: string) => void;
  submitLabel?: string;
}) {
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<SubcategoryInput>({
    category_id: initial?.category_id ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    image_url: initial?.image_url ?? "",
    status: (initial?.status as Status) ?? "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SubcategoryInput>(k: K, v: SubcategoryInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data } = await supabase
        .from("categories")
        .select("id,name")
        .eq("writer_id", uid)
        .order("name");
      setCats(data ?? []);
    })();
  }, []);

  async function handleUpload(file: File) {
    const key = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage
      .from("subcategory-images")
      .upload(key, file);
    if (error) return setError(error.message);
    const { data: pub } = supabase.storage
      .from("subcategory-images")
      .getPublicUrl(key);
    set("image_url", pub.publicUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Not authenticated");

      if ((initial as any)?.id) {
        const { error } = await supabase
          .from("subcategories")
          .update({
            category_id: form.category_id,
            name: form.name,
            description: form.description,
            image_url: form.image_url,
            status: form.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", (initial as any).id)
          .eq("writer_id", uid);
        if (error) throw error;
        onSaved((initial as any).id);
      } else {
        const { data, error } = await supabase
          .from("subcategories")
          .insert({
            writer_id: uid,
            category_id: form.category_id,
            name: form.name,
            description: form.description,
            image_url: form.image_url,
            status: form.status,
          })
          .select("id")
          .single();
        if (error) throw error;
        onSaved(data.id);
      }
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="text-sm">Category</span>
        <select
          required
          value={form.category_id}
          onChange={(e) => set("category_id", e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="">Select a category</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Name</span>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100"
        />
      </label>

      <label className="block">
        <span className="text-sm">Description</span>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm">Image URL</span>
          <input
            value={form.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100"
          />
        </label>
        <label className="block">
          <span className="text-sm">or Upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleUpload(f);
            }}
            className="mt-1 w-full"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Status</span>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value as Status)}
          className="mt-1 w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 disabled:opacity-60"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
