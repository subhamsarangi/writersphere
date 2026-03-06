import type { ArticleStatus, StatusSfx } from "./types";

export function statusLabel(s: ArticleStatus): string {
  switch (s) {
    case "draft":
      return "Draft";
    case "published":
      return "Published";
    case "anonymous":
      return "Anonymous";
    case "unpublished":
      return "Unpublished";
    case "archived":
      return "Archived";
    case "deleted":
      return "Deleted";
  }
}

export function isStatusThatNeedsMetadata(s: ArticleStatus): boolean {
  return s === "published" || s === "anonymous" || s === "unpublished" || s === "archived";
}

export function hasRequiredMetadata(
  categoryId: string,
  tags: string[],
  mainImageUrl: string | null
): boolean {
  const hasMinTags = uniqueTags(tags).length >= 2;
  const hasCategory = Boolean(categoryId);
  const hasMainImage = Boolean(mainImageUrl);
  return hasMinTags && hasCategory && hasMainImage;
}

export function statusActionCopy(
  from: ArticleStatus,
  to: ArticleStatus,
): {
  title: string;
  body: string;
  confirmText: string;
  tone: "primary" | "danger";
  sfx: StatusSfx;
  toast: string;
  burst: "publish" | "archive" | null;
} {
  if (to === "published" && from !== "published") {
    return {
      title: "Publish this article?",
      body: "It will become visible on the public feed immediately.",
      confirmText: "Publish",
      tone: "primary",
      sfx: "publish",
      toast: "Published ✨",
      burst: "publish",
    };
  }

  if (to === "anonymous" && from !== "anonymous") {
    return {
      title: "Publish anonymously?",
      body: "Your article will be public but your identity will be hidden. You can reveal your identity later by changing to Published.",
      confirmText: "Publish Anonymously",
      tone: "primary",
      sfx: "publish",
      toast: "Published anonymously ✨",
      burst: "publish",
    };
  }

  if (to === "published" && from === "anonymous") {
    return {
      title: "Reveal your identity?",
      body: "Your article will now show your name as the author.",
      confirmText: "Reveal Identity",
      tone: "primary",
      sfx: "publish",
      toast: "Identity revealed",
      burst: null,
    };
  }

  if ((from === "published" || from === "anonymous") && to === "archived") {
    return {
      title: "Archive this public article?",
      body: "It will disappear from the public feed. You can restore it later.",
      confirmText: "Archive",
      tone: "danger",
      sfx: "archive",
      toast: "Archived",
      burst: "archive",
    };
  }

  if ((from === "published" || from === "anonymous") && (to === "draft" || to === "unpublished")) {
    return {
      title: "Make this article private?",
      body: "It will be removed from the public feed immediately.",
      confirmText: "Yes, make it private",
      tone: "danger",
      sfx: "unpublish",
      toast: "Now private",
      burst: null,
    };
  }

  if (to === "archived" && from !== "archived" && from !== "published" && from !== "anonymous") {
    return {
      title: "Archive this article?",
      body: "It won't be public. You can unarchive later.",
      confirmText: "Archive",
      tone: "danger",
      sfx: "archive",
      toast: "Archived",
      burst: "archive",
    };
  }

  return {
    title: "Change status?",
    body: `Change status from ${statusLabel(from)} to ${statusLabel(to)}?`,
    confirmText: "Confirm",
    tone: "primary",
    sfx: to === "archived" ? "archive" : "unpublish",
    toast: "Status updated",
    burst: null,
  };
}

export function nowIso() {
  return new Date().toISOString();
}

export function normalizeTag(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

export function uniqueTags(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of list) {
    const n = normalizeTag(t);
    if (!n) continue;
    const key = n.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

export function formatTime(ts: string | null) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export function getErrorMessage(e: unknown) {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  if (e instanceof Error) return e.message;
  return typeof e === "string" ? e : JSON.stringify(e);
}

export function playSfx(kind: StatusSfx): void {
  if (typeof window === "undefined") return;

  type WebkitAudioWindow = Window & {
    webkitAudioContext?: typeof AudioContext;
  };

  const w = window as WebkitAudioWindow;
  const Ctx = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctx) return;

  const ctx = new Ctx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();

  const now = ctx.currentTime;

  let f0 = 440;
  let f1 = 880;
  let dur = 0.12;

  if (kind === "unpublish") {
    f0 = 520;
    f1 = 220;
    dur = 0.14;
  } else if (kind === "archive") {
    f0 = 330;
    f1 = 440;
    dur = 0.18;
  }

  o.type = "sine";
  o.frequency.setValueAtTime(f0, now);
  o.frequency.exponentialRampToValueAtTime(f1, now + dur);

  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  o.connect(g);
  g.connect(ctx.destination);

  o.start(now);
  o.stop(now + dur);

  o.onended = () => {
    try {
      ctx.close();
    } catch {
      // ignore
    }
  };
}
