"use client";

import { useRouter } from "next/navigation";
import SubcategoryForm from "../../../../components/SubcategoryForm";
import BackButton from "../../../../components/BackButton";

export default function NewSubcategoryPage() {
  const router = useRouter();
  return (
    <main className="page-shell">
      <div className="page-inner space-y-8">
        <section className="space-y-4">
          <h1 className="page-title">New Subcategory</h1>
          <SubcategoryForm
            submitLabel="Create"
            onSaved={(id) =>
              router.replace(`/dashboard/subcategories/${id}/edit`)
            }
          />
        </section>

        {/* Floating Back Button - Mobile Only */}
        <div className="fixed bottom-6 left-6 z-10 md:hidden">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg">
            <BackButton />
          </div>
        </div>
      </div>
    </main>
  );
}
