import { useEffect, useState } from "react";

export function useLocalTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load theme from localStorage (only for article editor)
  useEffect(() => {
    const stored =
      (typeof window !== "undefined" &&
        (localStorage.getItem("ws_article_theme") as "dark" | "light" | null)) ||
      null;

    const initial = stored ?? "dark";
    setTheme(initial);
  }, []);

  // Save theme preference and apply to page
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("ws_article_theme", theme);
    } catch {}
  }, [theme]);

  // Apply theme to entire page and clean up on unmount
  useEffect(() => {
    if (typeof document === "undefined") return;
    
    // Store original theme to restore later
    const originalTheme = document.documentElement.dataset.theme;
    const originalColorMode = document.documentElement.dataset.colorMode;
    
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.colorMode = theme;
    
    // Restore original theme when component unmounts
    return () => {
      if (originalTheme !== undefined) {
        document.documentElement.dataset.theme = originalTheme;
      } else {
        document.documentElement.dataset.theme = "dark";
      }
      if (originalColorMode !== undefined) {
        document.documentElement.dataset.colorMode = originalColorMode;
      } else {
        document.documentElement.dataset.colorMode = "dark";
      }
    };
  }, [theme]);

  return {
    theme,
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  };
}
