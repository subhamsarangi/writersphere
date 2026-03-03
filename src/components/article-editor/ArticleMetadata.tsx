"use client";

import { useState } from "react";
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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subcategoryDropdownOpen, setSubcategoryDropdownOpen] = useState(false);

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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="field-input w-full text-left flex items-center gap-2 cursor-pointer bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600/70 transition [html[data-theme='light']_&]:bg-white [html[data-theme='light']_&]:border-slate-300 [html[data-theme='light']_&]:text-slate-900 [html[data-theme='light']_&]:hover:bg-slate-50"
                >
                  {categoryId === "" ? (
                    <span className="text-slate-400 [html[data-theme='light']_&]:text-slate-500">Select a category</span>
                  ) : (
                    <span>{categories.find(c => c.id === categoryId)?.name || "Select a category"}</span>
                  )}
                  <svg
                    className={`w-4 h-4 ml-auto text-slate-400 transition-transform [html[data-theme='light']_&]:text-slate-600 ${
                      categoryDropdownOpen ? "rotate-180" : ""
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

                {categoryDropdownOpen ? (
                  <div className="absolute z-10 mt-1 w-full bg-slate-700 border border-slate-600 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto [html[data-theme='light']_&]:bg-white [html[data-theme='light']_&]:border-slate-300">
                    <button
                      type="button"
                      onClick={() => {
                        onCategoryChange("");
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-600 transition text-slate-400 [html[data-theme='light']_&]:hover:bg-slate-100 [html[data-theme='light']_&]:text-slate-600"
                    >
                      Select a category
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onCategoryChange(c.id);
                          setCategoryDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-600 transition text-slate-100 [html[data-theme='light']_&]:hover:bg-slate-100 [html[data-theme='light']_&]:text-slate-900"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </label>

            <label className="field-label">
              <span className="text-slate-300 [html[data-theme='light']_&]:text-slate-900">Subcategory (optional)</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => categoryId && setSubcategoryDropdownOpen(!subcategoryDropdownOpen)}
                  disabled={!categoryId}
                  className={`field-input w-full text-left flex items-center gap-2 cursor-pointer bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600/70 transition [html[data-theme='light']_&]:bg-white [html[data-theme='light']_&]:border-slate-300 [html[data-theme='light']_&]:text-slate-900 [html[data-theme='light']_&]:hover:bg-slate-50 ${
                    !categoryId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {subcategoryId === "" ? (
                    <span className="text-slate-400 [html[data-theme='light']_&]:text-slate-500">
                      {categoryId ? "Select a subcategory" : "Pick a category first"}
                    </span>
                  ) : (
                    <span>{subcategories.find(s => s.id === subcategoryId)?.name || "Select a subcategory"}</span>
                  )}
                  <svg
                    className={`w-4 h-4 ml-auto text-slate-400 transition-transform [html[data-theme='light']_&]:text-slate-600 ${
                      subcategoryDropdownOpen ? "rotate-180" : ""
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

                {subcategoryDropdownOpen && categoryId ? (
                  <div className="absolute z-10 mt-1 w-full bg-slate-700 border border-slate-600 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto [html[data-theme='light']_&]:bg-white [html[data-theme='light']_&]:border-slate-300">
                    <button
                      type="button"
                      onClick={() => {
                        onSubcategoryChange("");
                        setSubcategoryDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-600 transition text-slate-400 [html[data-theme='light']_&]:hover:bg-slate-100 [html[data-theme='light']_&]:text-slate-600"
                    >
                      Select a subcategory
                    </button>
                    {subcategories.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          onSubcategoryChange(s.id);
                          setSubcategoryDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-600 transition text-slate-100 [html[data-theme='light']_&]:hover:bg-slate-100 [html[data-theme='light']_&]:text-slate-900"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
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
