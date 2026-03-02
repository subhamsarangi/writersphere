"use client";

import TagInput from "@/components/TagInput";
import type { CategoryOpt, SubcategoryOpt } from "./types";

type ArticleMetadataProps = {
  categoryId: string;
  subcategoryId: string;
  categories: CategoryOpt[];
  subcategories: SubcategoryOpt[];
  tags: string[];
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
  onCategoryChange,
  onSubcategoryChange,
  onTagsChange,
}: ArticleMetadataProps) {
  return (
    <div className="card-dashboard mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="field-label">
          <span>Category (required to publish)</span>
          <select
            className="field-input"
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
          <span>Subcategory (optional)</span>
          <select
            className="field-input"
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
            <span>Tags (min 2)</span>
          </div>
          <div className="text-xs text-slate-400">{tags.length}/2</div>
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
            <p className="mt-2 text-xs text-slate-500">
              Tip: press <strong>Enter</strong> or type a <strong>,</strong> to add
            </p>
          </div>

          {/* Right: Added Tags */}
          <div className="mt-2">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t.toLowerCase()}
                    type="button"
                    className="btn-chip"
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
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No tags added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
