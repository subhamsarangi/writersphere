"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";

const supabase = getSupabaseBrowserClient();

type Status = "active" | "inactive";

export type SubcategoryInput = {
  category_id: string;
  name: string;
  description?: string;
  image_url?: string;
  status: Status;
};

export type SubcategoryInitial = Partial<
  Omit<SubcategoryInput, "description" | "image_url">
> & {
  id?: string;
  description?: string | null;
  image_url?: string | null;
};

type CategoryOption = { id: string; name: string };

type SubcategoryFormProps = {
  initial?: SubcategoryInitial;
  onSaved: (id: string) => void;
  submitLabel?: string;
};

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  );
}

export default function SubcategoryForm({
  initial,
  onSaved,
  submitLabel = "Save",
}: SubcategoryFormProps) {
  const [cats, setCats] = useState<CategoryOption[]>([]);

  const [form, setForm] = useState<SubcategoryInput>({
    category_id: initial?.category_id ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    image_url: initial?.image_url ?? "",
    status: initial?.status ?? "active",
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

      const { data, error } = await supabase
        .from("categories")
        .select("id,name")
        .eq("writer_id", uid)
        .order("name");

      if (error) {
        setError(error.message);
        return;
      }

      setCats((data ?? []) as CategoryOption[]);
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

      const initialId = initial?.id;

      if (initialId) {
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
          .eq("id", initialId)
          .eq("writer_id", uid);

        if (error) throw error;

        onSaved(initialId);
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
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="field-label">
        <span>Category</span>
        <select
          required
          value={form.category_id}
          onChange={(e) => set("category_id", e.target.value)}
          className="field-input"
        >
          <option value="">Select a category</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        <span>Name</span>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="field-input"
        />
      </label>

      <label className="field-label">
        <span>Description</span>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="field-input"
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="field-label">
          <span>Image URL</span>
          <input
            value={form.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            className="field-input"
          />
        </label>

        <label className="field-label">
          <span>or Upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleUpload(f);
            }}
            className="mt-1 w-full text-sm"
          />
        </label>
      </div>

      <label className="field-label">
        <span>Status</span>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value as Status)}
          className="field-input"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary inline-flex items-center gap-2 w-fit"
      >
        {saving && <Spinner />}
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
