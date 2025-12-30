"use client";

import { useRouter } from "next/navigation";
import CategoryForm from "../../../../components/CategoryForm";
import BackButton from "../../../../components/BackButton";

export default function NewCategoryPage() {
  const router = useRouter();

  return (
    <main className="page-shell">
      <div className="page-inner">
        <BackButton />
        <section className="space-y-4">
          <h1 className="page-title">New Category</h1>
          <CategoryForm
            submitLabel="Create"
            onSaved={(id) => router.replace(`/dashboard/categories/${id}/view`)}
          />
        </section>
      </div>
    </main>
  );
}
