"use client";

import { useState } from "react";
import Image from "next/image";
import TagInput from "@/components/TagInput";
import type { CategoryOpt, SubcategoryOpt } from "./types";

type ArticleMetadataProps = {
  categoryId: string;
  subcategoryId: string;
  categories: CategoryOpt[];
  subcategories: SubcategoryOpt[];
  tags: string[];
  mainImageUrl: string | null;
  expanded: boolean;
  onToggle: () => void;
  onCategoryChange: (id: string) => void;
  onSubcategoryChange: (id: string) => void;
  onTagsChange: (tags: string[]) => void;
  onMainImageClick: () => void;
};

export function ArticleMetadata({
  categoryId,
  subcategoryId,
  categories,
  subcategories,
  tags,
  mainImageUrl,
  expanded,
  onToggle,
  onCategoryChange,
  onSubcategoryChange,
  onTagsChange,
  onMainImageClick,
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
          {/* Main Image and Tags - side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Main Image */}
            <div className="max-w-md">
              <label className="field-label">
                <span className="text-slate-300 [html[data-theme='light']_&]:text-slate-900">
                  Main Image (required to publish)
                </span>
              </label>
              <button
                type="button"
                onClick={onMainImageClick}
                className="w-full mt-2 relative group"
              >
                {mainImageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border-2 border-slate-600 hover:border-blue-500 transition [html[data-theme='light']_&]:border-slate-300 [html[data-theme='light']_&]:hover:border-blue-500">
                    <Image
                      src={mainImageUrl}
                      alt="Article main"
                      width={800}
                      height={400}
                      className="w-full h-32 sm:h-40 object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Click to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 sm:h-40 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 transition bg-slate-700/30 [html[data-theme='light']_&]:bg-slate-50 [html[data-theme='light']_&]:border-slate-300 [html[data-theme='light']_&]:hover:border-blue-500">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-10 w-10 text-slate-400 [html[data-theme='light']_&]:text-slate-500"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-slate-300 [html[data-theme='light']_&]:text-slate-700">
                        Click to add main image
                      </p>
                      <p className="text-xs text-slate-500 [html[data-theme='light']_&]:text-slate-600">
                        Required for publishing
                      </p>
                    </div>
                  </div>
                )}
              </button>
            </div>

            {/* Tags */}
            <div>
              <label className="field-label">
                <span className="text-slate-300 [html[data-theme='light']_&]:text-slate-900">
                  Tags (at least 2 required to publish)
                </span>
              </label>
              <TagInput tags={tags} onChange={onTagsChange} />
            </div>
          </div>

          {/* Category and Subcategory */}
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
        </div>
      )}
    </div>
  );
}
