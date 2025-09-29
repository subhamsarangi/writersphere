"use client";

import { useRouter } from "next/navigation";
import CategoryForm from "../../../../components/CategoryForm";

export default function NewCategoryPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">New Category</h1>
      <CategoryForm
        submitLabel="Create"
        onSaved={(id) => router.replace(`/dashboard/categories/${id}/edit`)}
      />
    </main>
  );
}
