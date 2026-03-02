"use client";

import TagInput from "@/components/TagInput";
import type { CategoryOpt, SubcategoryOpt } from "./types";

type ArticleMetadataProps = {
  categoryId: string;
  subcategoryId: string;
  categories: CategoryOpt[];
  subcategories: SubcategoryOpt[];
  tags: string[];
  expanded: boolean;
  onToggle: () => void;
  onCategoryChange: (id: string) => void;
  onSubcategoryChange: (id: string) => void;
  onTagsChange: (tags: string[]) => void;
};

export function ArticleMetadata({
  categoryId,
  subcategoryId,
  categories,
  subcategories,
  tags,
  expanded,
  onToggle,
  onCategoryChange,
  onSubcategoryChange,
  onTagsChange,
}: ArticleMetadataProps) {
  return (
    <div className="mb-6 rounded-xl border border-slate-700 bg-slate-700/50 shadow-sm font-mono [html[data-theme='light']_&]:bg-slate-100 [html[data-theme='light']_&]:border-slate-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-700/70 transition rounded-t-xl [html[data-theme='light']_&]:hover:bg-slate-200"
      >
        <span className="text-sm font-medium text-slate-200 [html[data-theme='light']_&]:text-slate-900">
          Article Metadata
        </span>
        <svg
          className={`w-5 h-5 text-slate-300 transition-transform [html[data-theme='light']_&]:text-slate-700 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="p-5 pt-0 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="field-label">
              <span className="text-slate-300 [html[data-theme='light']_&]:text-slate-900">Category (required to publish)</span>
              <select
                className="field-input bg-slate-700 border-slate-600 text-slate-100 [html[data-theme='light']_&]:bg-white [html[data-theme='light']_&]:border-slate-300 [html[data-theme='light']_&]:text-slate-900"
                value={categoryId}
                onChange={(e) => onCategoryChange(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              <span className="text-slate-300 [html[data-theme='light']_&]:text-slate-900">Subcategory (optional)</span>
              <select
                className={`field-input bg-slate-700 border-slate-600 text-slate-100 [html[data-theme='light']_&]:bg-white [html[data-theme='light']_&]:border-slate-300 [html[data-theme='light']_&]:text-slate-900 ${
                  !categoryId ? "opacity-50 cursor-not-allowed" : ""
                }`}
                value={subcategoryId}
                onChange={(e) => onSubcategoryChange(e.target.value)}
                disabled={!categoryId}
              >
                <option value="">
                  {categoryId ? "Select a subcategory" : "Pick a category first"}
                </option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="field-label">
                <span className="text-slate-300 [html[data-theme='light']_&]:text-slate-900">Tags (min 2)</span>
              </div>
              <div className="text-xs text-slate-400 [html[data-theme='light']_&]:text-slate-600">{tags.length}/2</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left: Tag Input */}
              <div>
                <TagInput
                  label=""
                  tags={[]}
                  onChange={(newTags) => {
                    // Only add new tags that aren't already in the list
                    const existingLower = tags.map(t => t.toLowerCase());
                    const toAdd = newTags.filter(t => !existingLower.includes(t.toLowerCase()));
                    if (toAdd.length > 0) {
                      onTagsChange([...tags, ...toAdd]);
                    }
                  }}
                  placeholder="Add tag… (Enter / comma)"
                />
                <p className="mt-2 text-xs text-slate-400 [html[data-theme='light']_&]:text-slate-600">
                  Tip: press <strong>Enter</strong> or type a <strong>,</strong> to add
                </p>
              </div>

              {/* Right: Added Tags */}
              <div className="mt-2">
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => {
                      const isPoetry = t.toLowerCase() === 'poetry';
                      return (
                        <button
                          key={t.toLowerCase()}
                          type="button"
                          className={`btn-chip ${
                            isPoetry
                              ? 'poetry-tag !bg-purple-900/40 !text-purple-200 !border-purple-700/60 shadow-sm shadow-purple-500/20 [html[data-theme=\'light\']_&]:!bg-purple-100 [html[data-theme=\'light\']_&]:!text-purple-900 [html[data-theme=\'light\']_&]:!border-purple-300'
                              : 'bg-slate-600/50 border-slate-500/50 [html[data-theme=\'light\']_&]:bg-slate-200 [html[data-theme=\'light\']_&]:border-slate-300 [html[data-theme=\'light\']_&]:text-slate-900'
                          }`}
                          onClick={() => {
                            const key = t.toLowerCase();
                            onTagsChange(tags.filter((x) => x.toLowerCase() !== key));
                          }}
                          title="Remove tag"
                        >
                          #{t}{" "}
                          <span aria-hidden="true" className="opacity-70">
                            ×
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic [html[data-theme='light']_&]:text-slate-600">No tags added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
