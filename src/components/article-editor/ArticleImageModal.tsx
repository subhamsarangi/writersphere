"use client";

import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

type ArticleImageModalProps = {
  isOpen: boolean;
  currentImageUrl: string | null;
  onClose: () => void;
  onImageSelect: (url: string) => void;
};

type TabType = "upload" | "prompt" | "generate";

export function ArticleImageModal({
  isOpen,
  currentImageUrl,
  onClose,
  onImageSelect,
}: ArticleImageModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const oldImageUrl = currentImageUrl; // Used for comparison and cleanup

  if (!isOpen) return null;

  const deleteOldImage = async (url: string) => {
    // Only delete if it's from our R2 bucket
    if (!url.includes("article-images/")) return;

    try {
      await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch (error) {
      console.error("Failed to delete old image:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      // Compress image
      const options = {
        maxSizeMB: 0.3, // 300KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/jpeg",
      };

      const compressedFile = await imageCompression(file, options);

      // Check if compressed file is still over 300KB
      if (compressedFile.size > 300 * 1024) {
        setUploadError("Image is too large. Even after compression, it exceeds 300KB. Please use a smaller image.");
        setUploading(false);
        return;
      }

      // Create a preview URL
      const objectUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(objectUrl);

      // Upload to R2
      const formData = new FormData();
      formData.append("file", compressedFile, `compressed-${file.name}`);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      
      // Don't delete old image yet - wait until user clicks "Save Image"
      
      // Update preview with permanent URL
      setPreviewUrl(data.url);
      
    } catch (error) {
      setUploadError("Failed to upload image");
      console.error(error);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = async () => {
    if (closing) return;
    
    setClosing(true);
    try {
      // If user uploaded a new image but didn't save, delete it
      if (previewUrl && previewUrl !== oldImageUrl && previewUrl.includes("article-images/")) {
        await deleteOldImage(previewUrl);
      }
      onClose();
    } finally {
      setClosing(false);
    }
  };

  const handleSave = async () => {
    if (!previewUrl || saving) return;
    
    setSaving(true);
    try {
      // Delete old image only when saving the new one
      if (oldImageUrl && oldImageUrl !== previewUrl && oldImageUrl.includes("article-images/")) {
        await deleteOldImage(oldImageUrl);
      }
      onImageSelect(previewUrl);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col [html[data-theme='light']_&]:bg-white [html[data-theme='light']_&]:border-slate-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 [html[data-theme='light']_&]:border-slate-300">
          <h2 className="text-xl font-semibold text-slate-100 [html[data-theme='light']_&]:text-slate-900">
            Article Main Image
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading || saving || closing}
            className="text-slate-400 hover:text-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed [html[data-theme='light']_&]:text-slate-600 [html[data-theme='light']_&]:hover:text-slate-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 [html[data-theme='light']_&]:border-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === "upload"
                ? "text-blue-400 border-b-2 border-blue-400 bg-slate-700/50 [html[data-theme='light']_&]:text-blue-600 [html[data-theme='light']_&]:border-blue-600 [html[data-theme='light']_&]:bg-slate-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 [html[data-theme='light']_&]:text-slate-600 [html[data-theme='light']_&]:hover:text-slate-900 [html[data-theme='light']_&]:hover:bg-slate-50"
            }`}
          >
            <span className="hidden sm:inline">Upload Image</span>
            <span className="sm:hidden">Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prompt")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === "prompt"
                ? "text-blue-400 border-b-2 border-blue-400 bg-slate-700/50 [html[data-theme='light']_&]:text-blue-600 [html[data-theme='light']_&]:border-blue-600 [html[data-theme='light']_&]:bg-slate-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 [html[data-theme='light']_&]:text-slate-600 [html[data-theme='light']_&]:hover:text-slate-900 [html[data-theme='light']_&]:hover:bg-slate-50"
            }`}
          >
            <span className="hidden sm:inline">AI Prompt</span>
            <span className="sm:hidden">Prompt</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("generate")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === "generate"
                ? "text-blue-400 border-b-2 border-blue-400 bg-slate-700/50 [html[data-theme='light']_&]:text-blue-600 [html[data-theme='light']_&]:border-blue-600 [html[data-theme='light']_&]:bg-slate-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 [html[data-theme='light']_&]:text-slate-600 [html[data-theme='light']_&]:hover:text-slate-900 [html[data-theme='light']_&]:hover:bg-slate-50"
            }`}
          >
            <span className="hidden sm:inline">AI Generate</span>
            <span className="sm:hidden">Generate</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "upload" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300 [html[data-theme='light']_&]:text-slate-700">
                Upload a main image for your article. This image will be displayed in the feed and at the top of your article.
              </p>

              {/* File Input */}
              <div className="mt-4">
                <label className="block">
                  <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-lg hover:border-slate-500 transition cursor-pointer bg-slate-700/30 [html[data-theme='light']_&]:bg-slate-50 [html[data-theme='light']_&]:border-slate-300 [html[data-theme='light']_&]:hover:border-slate-400">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-slate-400 [html[data-theme='light']_&]:text-slate-500"
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
                        {uploading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Compressing and uploading...
                          </span>
                        ) : (
                          "Click to upload or drag and drop"
                        )}
                      </p>
                      <p className="text-xs text-slate-500 [html[data-theme='light']_&]:text-slate-600">
                        Any image format, will be compressed to under 300KB
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {uploadError && (
                <p className="text-sm text-red-400 [html[data-theme='light']_&]:text-red-600">
                  {uploadError}
                </p>
              )}

              {/* Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm text-slate-300 mb-2 [html[data-theme='light']_&]:text-slate-700">
                    Preview:
                  </p>
                  <div className="relative rounded-lg overflow-hidden border border-slate-600 [html[data-theme='light']_&]:border-slate-300">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={800}
                      height={400}
                      className="w-full h-auto max-h-96 object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        // Only delete if it's a newly uploaded image (not the original)
                        if (previewUrl && previewUrl !== oldImageUrl && previewUrl.includes("article-images/")) {
                          await deleteOldImage(previewUrl);
                        }
                        setPreviewUrl(oldImageUrl); // Revert to original
                        setUploadError(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 rounded-full text-white transition"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "prompt" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300 [html[data-theme='light']_&]:text-slate-700">
                Get an AI-generated prompt to create an image for your article using platforms like DALL-E, Midjourney, or Stable Diffusion.
              </p>
              {/* TODO: Implement AI prompt generation */}
              <div className="text-center py-12 text-slate-500">
                Coming soon...
              </div>
            </div>
          )}

          {activeTab === "generate" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300 [html[data-theme='light']_&]:text-slate-700">
                Generate 2 AI images based on your article content. Choose the one that fits best.
              </p>
              {/* TODO: Implement AI image generation */}
              <div className="text-center py-12 text-slate-500">
                Coming soon...
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-700 [html[data-theme='light']_&]:border-slate-300">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading || saving || closing}
            className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {closing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Canceling...
              </span>
            ) : (
              "Cancel"
            )}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!previewUrl || uploading || saving || closing}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : previewUrl ? (
              "Save Image"
            ) : (
              "Select an Image"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
