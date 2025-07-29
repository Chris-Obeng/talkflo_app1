import { useState, useEffect, useRef } from "react";

interface EditableContentProps {
  initialContent: string;
  onSave: (newContent: string) => Promise<void>;
}

export function EditableContent({ initialContent, onSave }: EditableContentProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleBlur = () => {
    if (content !== initialContent) {
      onSave(content);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={(e) => setContent(e.target.value)}
      onBlur={handleBlur}
      className="w-full bg-transparent text-gray-300 focus:outline-none resize-none text-base leading-relaxed note-text"
      placeholder="Start writing your note..."
    />
  );
}
