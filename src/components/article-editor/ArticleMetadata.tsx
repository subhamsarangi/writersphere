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
        <div className="flex items-center justify-between gap-2">
          <div className="field-label">
            <span>Tags (min 2)</span>
          </div>
          <div className="text-xs text-slate-400">{tags.length}/2</div>
        </div>

        <div className="mt-2">
          <TagInput
            label=""
            tags={tags}
            onChange={onTagsChange}
            placeholder="Add tag… (Enter / comma)"
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Tip: press <strong>Enter</strong> or type a <strong>,</strong> to
          add. Click a tag to remove.
        </p>
      </div>
    </div>
  );
}
