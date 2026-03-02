"use client";

import type { ArticleStatus } from "./types";
import { formatTime, isStatusThatNeedsMetadata } from "./utils";

type ArticleEditorHeaderProps = {
  title: string;
  body: string;
  status: ArticleStatus;
  saveMsg: string | null;
  isDirty: boolean;
  lastSavedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
  unpublishedAt: string | null;
  archivedAt: string | null;
  deletedAt: string | null;
  preview: boolean;
  theme: "dark" | "light";
  saving: boolean;
  deleting: boolean;
  hasRequiredMetadata: boolean;
  onTitleChange: (title: string) => void;
  onPreviewToggle: () => void;
  onThemeToggle: () => void;
  onStatusChange: (status: ArticleStatus) => void;
  onSave: () => void;
  onError: (error: string) => void;
};

export function ArticleEditorHeader({
  title,
  body,
  status,
  saveMsg,
  isDirty,
  lastSavedAt,
  createdAt,
  updatedAt,
  publishedAt,
  unpublishedAt,
  archivedAt,
  deletedAt,
  preview,
  theme,
  saving,
  deleting,
  hasRequiredMetadata,
  onTitleChange,
  onPreviewToggle,
  onThemeToggle,
  onStatusChange,
  onSave,
  onError,
}: ArticleEditorHeaderProps) {
  const hasContent = body.trim().length > 0;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex-1">
          <div
            ref={(el) => {
              if (el && status === "draft" && !el.dataset.initialized) {
                el.dataset.initialized = "true";
                el.focus();
                // Move cursor to end
                const range = document.createRange();
                const sel = window.getSelection();
                if (el.childNodes.length > 0) {
                  range.setStart(el.childNodes[0], el.textContent?.length || 0);
                  range.collapse(true);
                  sel?.removeAllRanges();
                  sel?.addRange(range);
                }
              }
              // Update content only if it differs and element is not focused
              if (el && el !== document.activeElement && el.textContent !== title) {
                el.textContent = title;
              }
            }}
            contentEditable
            suppressContentEditableWarning
            className="page-title-input break-words"
            onInput={(e) => {
              const text = e.currentTarget.textContent || "";
              onTitleChange(text);
            }}
            onDoubleClick={(e) => {
              if (status !== "draft") {
                e.currentTarget.focus();
              }
            }}
            onBlur={(e) => {
              e.currentTarget.classList.remove("page-title-input-focused");
              // Ensure we have the text content
              const text = e.currentTarget.textContent || "";
              if (text !== title) {
                onTitleChange(text);
              }
            }}
            onFocus={(e) => {
              e.currentTarget.classList.add("page-title-input-focused");
            }}
            onKeyDown={(e) => {
              // Prevent Enter key from creating new lines
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              // Prevent pasting formatted content
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
            }}
            data-placeholder="Write your article title here..."
          />
          <div className="page-subtitle">
            {saveMsg ? (
              <span className="text-emerald-300">{saveMsg}</span>
            ) : isDirty ? (
              <span className="text-amber-300">Unsaved changes</span>
            ) : (
              <span className="text-slate-400">Up to date</span>
            )}
            {lastSavedAt ? (
              <span className="ml-2 text-slate-500">
                · Last saved: {formatTime(lastSavedAt)}
              </span>
            ) : null}

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-slate-500">
              <span>Created: {formatTime(createdAt)}</span>
              {!lastSavedAt && updatedAt && (
                <span>Updated: {formatTime(updatedAt)}</span>
              )}
              {publishedAt && <span>Published: {formatTime(publishedAt)}</span>}
              {unpublishedAt && (
                <span>Unpublished: {formatTime(unpublishedAt)}</span>
              )}
              {archivedAt && <span>Archived: {formatTime(archivedAt)}</span>}
              {deletedAt && <span>Deleted: {formatTime(deletedAt)}</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasContent && (
            <button className="btn-ghost hidden sm:flex" type="button" onClick={onPreviewToggle}>
            {preview ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
                Edit
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                Preview
              </>
            )}
          </button>
          )}

          <button className="btn-ghost" type="button" onClick={onThemeToggle}>
            {theme === "dark" ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                  />
                </svg>
                Dark
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  />
                </svg>
                Light
              </>
            )}
          </button>

          <select
            className="status-dropdown"
            value={status}
            disabled={saving || deleting}
            onChange={(e) => {
              const next = e.target.value as ArticleStatus;
              if (next === status || next === "deleted") return;

              const nextNeedsMetadata = isStatusThatNeedsMetadata(next);
              if (nextNeedsMetadata && !hasRequiredMetadata) {
                onError(
                  "Pick a category and add at least 2 tags before publishing/unpublishing/archiving."
                );
                return;
              }

              onStatusChange(next);
            }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
            <option value="archived">Archived</option>
          </select>

          <button
            className="btn-primary !w-auto"
            type="button"
            disabled={saving}
            onClick={onSave}
          >
            {saving ? "Saving…" : "Save now"}
          </button>
        </div>
      </div>

      {/* Floating Preview Button for Mobile */}
      {hasContent && (
        <button
          className="fixed bottom-6 right-6 z-50 sm:hidden btn-primary !w-auto shadow-lg flex items-center gap-2 whitespace-nowrap"
          type="button"
          onClick={onPreviewToggle}
        >
        {preview ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
            Edit
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            Preview
          </>
        )}
      </button>
      )}
    </>
  );
}
