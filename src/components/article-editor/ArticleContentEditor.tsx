"use client";

import MDEditor from "@uiw/react-md-editor";

type ArticleContentEditorProps = {
  body: string;
  preview: boolean;
  onChange: (value: string) => void;
};

export function ArticleContentEditor({
  body,
  preview,
  onChange,
}: ArticleContentEditorProps) {
  return (
    <div className="card-dashboard">
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
        />
      )}
    </div>
  );
}
