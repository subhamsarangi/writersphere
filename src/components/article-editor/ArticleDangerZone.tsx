type ArticleDangerZoneProps = {
  deleting: boolean;
  saving: boolean;
  onDelete: () => void;
};

export function ArticleDangerZone({
  deleting,
  saving,
  onDelete,
}: ArticleDangerZoneProps) {
  return (
    <div className="card-dashboard danger-zone mt-6 border border-red-900/60 bg-black/40">
      <div className="danger-zone-title text-red-200 font-semibold">
        Danger zone
      </div>
      <p className="danger-zone-text text-sm text-slate-300 mt-2">
        Deleting this article will remove it from your lists and block any
        further edits.
      </p>
      <p className="danger-zone-subtext text-xs text-slate-500 mt-1">
        This action is intended to be permanent in the app.
      </p>

      <button
        type="button"
        disabled={deleting || saving}
        onClick={onDelete}
        className="btn-danger-zone mt-4 btn-ghost !w-full sm:!w-auto !border-red-800 !text-red-200 hover:!bg-red-950/50 disabled:opacity-60"
      >
        {deleting ? "Deleting…" : "Delete article"}
      </button>
    </div>
  );
}
