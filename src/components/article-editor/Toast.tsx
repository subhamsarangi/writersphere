import type { ToastState } from "./types";

export function Toast({ state }: { state: ToastState | null }) {
  if (!state) return null;
  return (
    <div
      className={`ws-toast ${
        state.kind === "error" ? "ws-toast--error" : "ws-toast--success"
      }`}
      role="status"
      aria-live="polite"
    >
      {state.message}
    </div>
  );
}
