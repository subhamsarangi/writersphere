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
      className="btn-chip inline-flex items-center gap-2 text-sm"
    >
      <FontAwesomeIcon icon={faArrowLeft} />
      Back
    </button>
  );
}
