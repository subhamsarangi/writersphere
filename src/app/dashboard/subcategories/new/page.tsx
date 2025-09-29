"use client";

import { useRouter } from "next/navigation";
import SubcategoryForm from "../../../../components/SubcategoryForm";

export default function NewSubcategoryPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">New Subcategory</h1>
      <SubcategoryForm
        submitLabel="Create"
        onSaved={(id) => router.replace(`/dashboard/subcategories/${id}/edit`)}
      />
    </main>
  );
}
