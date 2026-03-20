"use client";

import React from "react";
import Navbar from "../components/Navbar";
import SupabaseErrorModal from "../components/SupabaseErrorModal";
import { useSupabaseErrorDetection } from "../lib/useSupabaseErrorDetection";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { showErrorModal, handleClose, handleRetry, triggerTestModal } = useSupabaseErrorDetection();

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "E") {
        triggerTestModal();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [triggerTestModal]);

  return (
    <>
      <Navbar />
      {children}
      <SupabaseErrorModal
        isOpen={showErrorModal}
        onClose={handleClose}
        onRetry={handleRetry}
      />
    </>
  );
}
