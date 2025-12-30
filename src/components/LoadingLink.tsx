"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type LoadingMode = "replace" | "append" | "prepend" | "overlay";

type LoadingLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;

  /** What to do visually while loading */
  loadingMode?: LoadingMode;

  /** Optional custom content to show while loading */
  loadingText?: React.ReactNode;

  /** Show spinner while loading (default true). Ignored for overlay mode. */
  showSpinner?: boolean;

  /** Provide a custom spinner node */
  spinner?: React.ReactNode;
  spinnerClassName?: string;

  /** Disable the button when already on the same route (default true) */
  disableOnCurrent?: boolean;
};

function DefaultSpinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

export default function LoadingLink({
  href,
  className = "",
  children,
  loadingMode = "replace",
  loadingText,
  showSpinner = true,
  spinner,
  spinnerClassName = "",
  disableOnCurrent = true,
}: LoadingLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const isCurrent = useMemo(() => pathname === href, [pathname, href]);

  const SpinnerNode = useMemo(() => {
    // overlay mode = NO spinner, always
    if (loadingMode === "overlay") return null;
    if (loadingMode === "replace" && loadingText != null) return null;
    if (!showSpinner) return null;
    return spinner ?? <DefaultSpinner className={spinnerClassName} />;
  }, [loadingMode, loadingText, showSpinner, spinner, spinnerClassName]);

  const shouldDisable = loading || (disableOnCurrent && isCurrent);

  const MainContent = useMemo(() => {
    if (!loading) return children;

    if (loadingText != null) return loadingText;

    if (loadingMode === "replace") return null;

    return children;
  }, [loading, children, loadingText, loadingMode]);

  const contentClassWhileLoading =
    loading && loadingMode === "overlay" ? "opacity-50" : "";

  return (
    <button
      type="button"
      disabled={shouldDisable}
      onClick={() => {
        if (disableOnCurrent && isCurrent) return;
        if (loading) return;
        setLoading(true);
        router.push(href);
      }}
      className={`${className} inline-flex items-center gap-2 disabled:opacity-60`}
      aria-busy={loading}
    >
      {/* PREPEND */}
      {loading && loadingMode === "prepend" ? SpinnerNode : null}

      {/* REPLACE */}
      {loading && loadingMode === "replace" ? (
        <>
          {SpinnerNode}
          {loadingText != null ? <span>{loadingText}</span> : null}
        </>
      ) : (
        <span className={contentClassWhileLoading}>{MainContent}</span>
      )}

      {/* APPEND */}
      {loading && loadingMode === "append" ? SpinnerNode : null}
    </button>
  );
}
