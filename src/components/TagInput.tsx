"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type TagInputProps = {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
};

type RejectReason = "duplicate" | "space" | "empty";
type RejectedItem = { raw: string; reason: RejectReason };

type PasteAlert = {
  kind: "success" | "error";
  added: string[];
  rejected: RejectedItem[];
} | null;

// Split on commas and newlines (paste often includes newlines)
const SPLIT_RE = /[,\n]+/;

function humanReason(r: RejectReason) {
  switch (r) {
    case "duplicate":
      return "duplicate";
    case "space":
      return "contains spaces";
    case "empty":
      return "empty / only #";
  }
}

function normalizeTag(raw: string) {
  const trimmed = raw.trim();
  const stripped = trimmed.replace(/^#+/, "").trim();

  if (!stripped) return { ok: false as const, reason: "empty" as const };

  // Reject any whitespace anywhere in tag (spaces/tabs/etc.)
  if (/\s/.test(stripped))
    return { ok: false as const, reason: "space" as const };

  return { ok: true as const, value: stripped };
}

export default function TagInput({
  tags,
  onChange,
  placeholder = "Type a tag and press Enter or comma…",
  label = "Tags",
  disabled = false,
}: TagInputProps) {
  const [value, setValue] = useState("");
  const [alert, setAlert] = useState<PasteAlert>(null);

  // For stable dedupe (case-insensitive) while keeping original casing of the first occurrence
  const existingIndex = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of tags) m.set(t.toLowerCase(), t);
    return m;
  }, [tags]);

  const clearAlertTimer = useRef<number | null>(null);
  const setAlertAutoClear = useCallback((next: PasteAlert) => {
    setAlert(next);
    if (clearAlertTimer.current) window.clearTimeout(clearAlertTimer.current);
    if (next) {
      clearAlertTimer.current = window.setTimeout(() => setAlert(null), 10000);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (clearAlertTimer.current) window.clearTimeout(clearAlertTimer.current);
    };
  }, []);

  const addTokens = useCallback(
    (tokens: string[], opts?: { showPasteAlert?: boolean }) => {
      const added: string[] = [];
      const rejected: RejectedItem[] = [];

      const nextMap = new Map(existingIndex);

      for (const tok of tokens) {
        const raw = tok;

        const n = normalizeTag(raw);
        if (!n.ok) {
          // If they pasted a visible token like "#" or "   ", report it as rejected
          if (raw.trim().length > 0) rejected.push({ raw, reason: n.reason });
          continue;
        }

        const key = n.value.toLowerCase();
        if (nextMap.has(key)) {
          rejected.push({ raw, reason: "duplicate" });
          continue;
        }

        nextMap.set(key, n.value);
        added.push(n.value);
      }

      if (added.length > 0 || rejected.length > 0) {
        onChange(Array.from(nextMap.values()));
      }

      if (opts?.showPasteAlert) {
        const kind: "success" | "error" =
          added.length > 0 ? "success" : "error";
        setAlertAutoClear({ kind, added, rejected });
      }

      return { added, rejected };
    },
    [existingIndex, onChange, setAlertAutoClear]
  );

  const commitValueAsTag = useCallback(() => {
    const v = value.trim();
    if (!v) return;

    const { added } = addTokens([v]);
    if (added.length > 0) setValue("");
  }, [addTokens, value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value;

      // Live-strip leading hashtags from the current chunk
      v = v.replace(/^#+/, "");

      // If user typed comma/newline (mobile comma key often lands here),
      // split and add all complete tokens; keep the last chunk as the input value.
      if (v.includes(",") || v.includes("\n")) {
        const parts = v.split(SPLIT_RE);
        const tail = parts.pop() ?? "";

        if (parts.length) addTokens(parts);

        setValue(tail.replace(/^#+/, ""));
        return;
      }

      setValue(v);
    },
    [addTokens]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Mobile Enter should NOT move focus/submit form; treat as “add tag”
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        commitValueAsTag();
        return;
      }

      // Optional: backspace removes last tag when empty (if you want it back)
      if (e.key === "Backspace" && !value && tags.length) {
        e.preventDefault();
        const last = tags[tags.length - 1];
        const key = last.toLowerCase();
        onChange(tags.filter((x) => x.toLowerCase() !== key));
      }
    },
    [commitValueAsTag, onChange, tags, value]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text") ?? "";
      const looksLikeList = text.includes(",") || text.includes("\n");

      if (!looksLikeList) return; // allow normal paste (single tag)

      e.preventDefault();

      const tokens = text
        .split(SPLIT_RE)
        .map((t) => t)
        .filter((t) => t.length > 0);
      addTokens(tokens, { showPasteAlert: true });

      setValue("");
    },
    [addTokens]
  );

  const removeTag = useCallback(
    (t: string) => {
      const key = t.toLowerCase();
      const next = tags.filter((x) => x.toLowerCase() !== key);
      onChange(next);
    },
    [onChange, tags]
  );

  return (
    <div className="space-y-2">
      {label ? (
        <label className="field-label">
          <span>{label}</span>
        </label>
      ) : null}

      <input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        disabled={disabled}
        className="field-input"
        placeholder={placeholder}
        inputMode="text"
        enterKeyHint="done"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* Existing tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t.toLowerCase()}
              type="button"
              className="btn-chip"
              onClick={() => removeTag(t)}
              title="Remove tag"
            >
              #{t}{" "}
              <span aria-hidden="true" className="opacity-70">
                ×
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Paste alert with per-token reasons */}
      {alert ? (
        <div
          className={alert.kind === "success" ? "alert-success" : "alert-error"}
        >
          <div className="font-medium">
            {alert.added.length > 0
              ? `Added ${alert.added.length} tag${
                  alert.added.length === 1 ? "" : "s"
                }`
              : "No tags added"}
            {alert.rejected.length > 0
              ? ` • Rejected ${alert.rejected.length}`
              : ""}
          </div>

          {alert.added.length > 0 ? (
            <div className="mt-1 text-sm opacity-90">
              Added: {alert.added.map((t) => `#${t}`).join(", ")}
            </div>
          ) : null}

          {alert.rejected.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-sm opacity-95">
              {alert.rejected.slice(0, 20).map((r, i) => (
                <li key={`${r.raw}-${i}`}>
                  <span className="font-mono">
                    {JSON.stringify(r.raw.trim())}
                  </span>{" "}
                  — {humanReason(r.reason)}
                </li>
              ))}
              {alert.rejected.length > 20 ? (
                <li>…and {alert.rejected.length - 20} more</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
