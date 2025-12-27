// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderTree,
  faLayerGroup,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [counts, setCounts] = useState<{
    categories: number;
    subcategories: number;
  }>({
    categories: 0,
    subcategories: 0,
  });

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      // 1) session + writer gate
      const { data } = await supabase.auth.getSession();
      const s = data.session ?? null;
      setSession(s);

      const role = s?.user?.user_metadata?.role;
      if (!s || role !== "writer") {
        router.replace("/"); // readers/non-auth → home
        return;
      }

      // 2) counts (parallel)
      const uid = s.user.id;
      const [catRes, subRes] = await Promise.all([
        supabase
          .from("categories")
          .select("*", { count: "exact", head: true })
          .eq("writer_id", uid),
        supabase
          .from("subcategories")
          .select("*", { count: "exact", head: true })
          .eq("writer_id", uid),
      ]);

      setCounts({
        categories: catRes.count ?? 0,
        subcategories: subRes.count ?? 0,
      });

      // 3) listen to auth changes; if role changes or logout → home
      const { data: listener } = supabase.auth.onAuthStateChange((_e, sess) => {
        const newRole = sess?.user?.user_metadata?.role;
        if (!sess || newRole !== "writer") {
          router.replace("/");
        } else {
          setSession(sess);
        }
      });
      unsub = listener?.subscription?.unsubscribe;

      setReady(true);
    })();

    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, [router]);

  if (!ready) return null; // or a skeleton

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {session?.user?.email && (
        <h3 className="text-sm font-normal text-gray-500">
          Signed in as {session.user.email}
        </h3>
      )}

      <br />

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Categories card */}
        <div className="rounded-xl border p-5 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border dark:border-gray-700">
                <FontAwesomeIcon icon={faFolderTree} />
              </span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Categories
                </p>
                <p className="text-2xl font-semibold">{counts.categories}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/categories/new"
                className="inline-flex items-center gap-2 rounded px-3 py-2 border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FontAwesomeIcon icon={faPlus} />
                New
              </Link>
              <Link
                href="/dashboard/categories"
                className="inline-flex items-center rounded px-3 py-2 border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Manage
              </Link>
            </div>
          </div>
        </div>

        {/* Subcategories card */}
        <div className="rounded-xl border p-5 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border dark:border-gray-700">
                <FontAwesomeIcon icon={faLayerGroup} />
              </span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Subcategories
                </p>
                <p className="text-2xl font-semibold">{counts.subcategories}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/subcategories/new"
                className="inline-flex items-center gap-2 rounded px-3 py-2 border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FontAwesomeIcon icon={faPlus} />
                New
              </Link>
              <Link
                href="/dashboard/subcategories"
                className="inline-flex items-center rounded px-3 py-2 border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Manage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
