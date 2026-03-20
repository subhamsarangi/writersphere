"use client";

import { useRef, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";

type ArticleContentEditorProps = {
  body: string;
  preview: boolean;
  tags: string[];
  onChange: (value: string) => void;
  onInput?: (event: InputEvent) => void;
};

export function ArticleContentEditor({
  body,
  preview,
  tags,
  onChange,
  onInput,
}: ArticleContentEditorProps) {
  const hasPoetryTag = tags.some(tag => ['poetry', 'poem', 'poems', 'poet'].includes(tag.toLowerCase()));
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Attach input listener to MDEditor's textarea
  useEffect(() => {
    if (!onInput || preview) return;
    
    const findTextarea = () => {
      const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement;
      if (textarea) {
        textareaRef.current = textarea;
        textarea.addEventListener('input', onInput as EventListener);
      }
    };
    
    // MDEditor renders asynchronously, so we need to wait a bit
    const timeout = setTimeout(findTextarea, 100);
    
    return () => {
      clearTimeout(timeout);
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('input', onInput as EventListener);
      }
    };
  }, [onInput, preview]);
  
  return (
    <div className={`card-dashboard p-0 md:p-5 mb-8 ${hasPoetryTag ? 'poetry-content' : ''} ${preview ? 'p-3 md:p-5' : ''}`}>
      {preview ? (
        hasPoetryTag ? (
          <div className="poetry-preview px-2 py-1">
            {(body || "").split(/\n\n+/).map((stanza, i) => (
              <p key={i} style={{ whiteSpace: 'pre-line', marginBottom: '1.2em', marginTop: 0 }}>
                {stanza.trim()}
              </p>
            ))}
          </div>
        ) : (
          <div className="prose max-w-none">
            <MDEditor.Markdown source={body || ""} />
          </div>
        )
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
