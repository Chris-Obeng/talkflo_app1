import { useState, useRef, useEffect } from "react";

interface EditableTitleProps {
  initialTitle: string;
  onSave: (newTitle: string) => void;
}

export function EditableTitle({ initialTitle, onSave }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (title.trim() !== "" && title.trim() !== initialTitle) {
      onSave(title.trim());
    } else {
      setTitle(initialTitle); // revert if empty or unchanged
    }
    setIsEditing(false);
  };

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer">
      {isEditing ? (
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="text-2xl md:text-4xl font-bold text-white bg-transparent border-none outline-none w-full heading"
        />
      ) : (
        <h1 className="text-2xl md:text-4xl font-bold text-white heading">{title}</h1>
      )}
    </div>
  );
}
