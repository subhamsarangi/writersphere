export function CelebrateBurst({ mode }: { mode: "publish" | "archive" | null }) {
  if (!mode) return null;
  return <div className={`ws-burst ws-burst--${mode}`} aria-hidden="true" />;
}
