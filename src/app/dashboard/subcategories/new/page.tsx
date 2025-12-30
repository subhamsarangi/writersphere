"use client";

import { useRouter } from "next/navigation";
import SubcategoryForm from "../../../../components/SubcategoryForm";
import BackButton from "../../../../components/BackButton";

export default function NewSubcategoryPage() {
  const router = useRouter();
  return (
    <main className="page-shell">
      <div className="page-inner">
        <BackButton />
        <section className="space-y-4">
          <h1 className="page-title">New Subcategory</h1>
          <SubcategoryForm
            submitLabel="Create"
            onSaved={(id) =>
              router.replace(`/dashboard/subcategories/${id}/edit`)
            }
          />
        </section>
      </div>
    </main>
  );
}
