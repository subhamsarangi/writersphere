// app/dashboard/write/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";

const KEY_ID = "ws_newdraft_id";

function uuidv4(): string {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("Secure crypto not available to generate UUID.");
  }
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return (
    hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" +
    hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20)
  );
}

export default function NewWritePage() {
  const supabase = getSupabaseBrowserClient();
  const [error, setError] = useState<string | null>(null);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user.id;
        if (!uid) {
          window.location.replace("/");
          return;
        }

        let draftId = "";
        try {
          draftId = sessionStorage.getItem(KEY_ID) ?? "";
        } catch {
          draftId = "";
        }

        if (!draftId) {
          const canRandomUUID =
            typeof globalThis.crypto !== "undefined" &&
            "randomUUID" in globalThis.crypto &&
            typeof globalThis.crypto.randomUUID === "function";
          draftId = canRandomUUID ? globalThis.crypto.randomUUID() : uuidv4();
          try {
            sessionStorage.setItem(KEY_ID, draftId);
          } catch {}
        }

        const { error: insErr } = await supabase.from("articles").insert({
          id: draftId,
          writer_id: uid,
          title: "Ugly Draft v1",
          body_md: "",
          status: "draft",
          last_saved_at: new Date().toISOString(),
        });

        if (insErr) {
          const code = (insErr as unknown as { code?: string }).code;
          if (code === "23505") {
            window.location.replace(`/dashboard/write/${draftId}`);
            return;
          }
          setError(insErr.message ?? JSON.stringify(insErr));
          return;
        }

        window.location.replace(`/dashboard/write/${draftId}`);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message :
          typeof e === "string" ? e : JSON.stringify(e);
        setError(msg);
      }
    })();
  }, [supabase]);

  // Show nothing while creating draft (no flash)
  if (!error) return null;

  return (
    <main className="page-shell">
      <div className="page-center">
        <div className="card-dashboard w-full max-w-xl">
          <div className="page-title">Couldn&apos;t create draft</div>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    </main>
  );
}
