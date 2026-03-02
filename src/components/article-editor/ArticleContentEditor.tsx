"use client";

import MDEditor from "@uiw/react-md-editor";

type ArticleContentEditorProps = {
  body: string;
  preview: boolean;
  tags: string[];
  onChange: (value: string) => void;
};

export function ArticleContentEditor({
  body,
  preview,
  tags,
  onChange,
}: ArticleContentEditorProps) {
  const hasPoetryTag = tags.some(tag => tag.toLowerCase() === 'poetry');
  
  return (
    <div className={`card-dashboard ${hasPoetryTag ? 'poetry-content' : ''} ${preview ? 'p-3 md:p-5' : ''}`}>
      {preview ? (
        <div className="prose max-w-none">
          <MDEditor.Markdown source={body || ""} />
        </div>
      ) : (
        <MDEditor
          value={body}
          onChange={(v) => onChange(v ?? "")}
          height={520}
          textareaProps={{ placeholder: "Write in Markdown…" }}
          preview="edit"
          hideToolbar={false}
          visibleDragbar={false}
        />
      )}
    </div>
  );
}
