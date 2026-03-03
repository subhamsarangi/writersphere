"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/dashboard/categories");
      }}
      className="fixed bottom-6 left-6 z-50 md:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/90 transition"
    >
      <FontAwesomeIcon icon={faArrowLeft} />
      Back
    </button>
  );
}
