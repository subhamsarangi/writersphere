"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";

export default function NewWritePage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("articles")
        .insert({
          writer_id: uid,
          title: "Untitled",
          body_md: "",
          status: "draft",
          last_saved_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (cancelled) return;

      if (error) {
        setError(error.message);
        return;
      }

      router.replace(`/dashboard/write/${data.id}`);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <main className="page-shell">
      <div className="page-center">
        {error ? (
          <div className="card-dashboard w-full max-w-xl">
            <div className="page-title">Couldn’t create draft</div>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        ) : (
          <div className="skeleton-card" />
        )}
      </div>
    </main>
  );
}
