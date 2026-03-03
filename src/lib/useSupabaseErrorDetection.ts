import { useState, useEffect } from "react";

export function useSupabaseErrorDetection() {
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    // Listen for global errors that might indicate Supabase connection issues
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message?.toLowerCase() || "";
      const errorStack = event.error?.stack?.toLowerCase() || "";
      
      // Check for common Supabase connection error patterns
      const isSupabaseError = 
        errorMessage.includes("supabase") ||
        errorMessage.includes("fetch") ||
        errorMessage.includes("network") ||
        errorMessage.includes("failed to fetch") ||
        errorStack.includes("supabase");

      if (isSupabaseError) {
        setShowErrorModal(true);
      }
    };

    window.addEventListener("error", handleError);
    
    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  return {
    showErrorModal,
    setShowErrorModal,
  };
}

export function isSupabaseConnectionError(error: unknown): boolean {
  if (!error) return false;
  
  const errorString = String(error).toLowerCase();
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : "";
  
  // Common patterns for connection/network errors
  return (
    errorString.includes("fetch") ||
    errorString.includes("network") ||
    errorString.includes("failed to fetch") ||
    errorString.includes("networkerror") ||
    errorString.includes("timeout") ||
    errorString.includes("econnrefused") ||
    errorString.includes("cors") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("failed to fetch")
  );
}
