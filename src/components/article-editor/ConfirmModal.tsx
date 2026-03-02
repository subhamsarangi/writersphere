import type { ConfirmState } from "./types";

export function ConfirmModal(props: {
  state: ConfirmState | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (s: ConfirmState) => void;
}) {
  const { state, busy, onCancel, onConfirm } = props;
  if (!state?.open) return null;

  return (
    <div
      className="ws-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={state.title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !busy) onCancel();
      }}
      tabIndex={-1}
    >
      <div className="ws-modal">
        <div className="ws-modal__head">
          <h3 className="ws-modal__title">{state.title}</h3>
        </div>

        <p className="ws-modal__body">{state.body}</p>

        <div className="ws-modal__actions">
          <button
            type="button"
            className="btn-chip"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            className={
              state.tone === "danger"
                ? "ws-btn ws-btn--danger"
                : "ws-btn ws-btn--primary"
            }
            onClick={() => onConfirm(state)}
            disabled={busy}
          >
            {busy ? "Working…" : state.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
