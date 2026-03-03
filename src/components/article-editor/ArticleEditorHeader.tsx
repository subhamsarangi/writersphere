"use client";

import { useState } from "react";
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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

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

          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              disabled={saving || deleting}
              className="status-dropdown w-auto min-w-[140px] flex items-center gap-2"
            >
              {status === "published" ? (
                <>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400">Published</span>
                </>
              ) : status === "draft" ? (
                <>
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-blue-400">Draft</span>
                </>
              ) : status === "unpublished" ? (
                <>
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="text-yellow-400">Unpublished</span>
                </>
              ) : status === "archived" ? (
                <>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span className="text-slate-400">Archived</span>
                </>
              ) : null}
              <svg
                className={`w-4 h-4 ml-auto text-slate-400 transition-transform ${
                  statusDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {statusDropdownOpen ? (
              <div className="absolute z-10 mt-1 right-0 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-lg overflow-hidden [html[data-theme='light']_&]:bg-white [html[data-theme='light']_&]:border-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    const next = "draft";
                    if (next === status) {
                      setStatusDropdownOpen(false);
                      return;
                    }
                    onStatusChange(next);
                    setStatusDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-600 transition flex items-center gap-2 [html[data-theme='light']_&]:hover:bg-slate-100"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-blue-400">Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = "published";
                    if (next === status) {
                      setStatusDropdownOpen(false);
                      return;
                    }
                    const nextNeedsMetadata = isStatusThatNeedsMetadata(next);
                    if (nextNeedsMetadata && !hasRequiredMetadata) {
                      onError("Pick a category and add at least 2 tags before publishing/unpublishing/archiving.");
                      setStatusDropdownOpen(false);
                      return;
                    }
                    onStatusChange(next);
                    setStatusDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-600 transition flex items-center gap-2 [html[data-theme='light']_&]:hover:bg-slate-100"
                >
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400">Published</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = "unpublished";
                    if (next === status) {
                      setStatusDropdownOpen(false);
                      return;
                    }
                    const nextNeedsMetadata = isStatusThatNeedsMetadata(next);
                    if (nextNeedsMetadata && !hasRequiredMetadata) {
                      onError("Pick a category and add at least 2 tags before publishing/unpublishing/archiving.");
                      setStatusDropdownOpen(false);
                      return;
                    }
                    onStatusChange(next);
                    setStatusDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-600 transition flex items-center gap-2 [html[data-theme='light']_&]:hover:bg-slate-100"
                >
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="text-yellow-400">Unpublished</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = "archived";
                    if (next === status) {
                      setStatusDropdownOpen(false);
                      return;
                    }
                    const nextNeedsMetadata = isStatusThatNeedsMetadata(next);
                    if (nextNeedsMetadata && !hasRequiredMetadata) {
                      onError("Pick a category and add at least 2 tags before publishing/unpublishing/archiving.");
                      setStatusDropdownOpen(false);
                      return;
                    }
                    onStatusChange(next);
                    setStatusDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-600 transition flex items-center gap-2 [html[data-theme='light']_&]:hover:bg-slate-100"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span className="text-slate-400">Archived</span>
                </button>
              </div>
            ) : null}
          </div>

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
