import { useState } from "react";
import { X, Plus } from "lucide-react";

interface TagManagerProps {
  initialTags: string[];
  onUpdateTags: (newTags: string[]) => void;
}

export function TagManager({ initialTags, onUpdateTags }: TagManagerProps) {
  const [tags, setTags] = useState(initialTags);
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleAddTag = () => {
    if (inputValue.trim() !== "" && !tags.includes(inputValue.trim())) {
      const newTags = [...tags, inputValue.trim()];
      setTags(newTags);
      onUpdateTags(newTags);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onUpdateTags(newTags);
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2 items-center">
        {tags.map(tag => (
          <div key={tag} className="flex items-center bg-gray-700 rounded-full px-3 py-1 text-sm">
            <span>{tag}</span>
            <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-gray-400 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {isEditing ? (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            onBlur={() => {
              handleAddTag();
              setIsEditing(false);
            }}
            className="bg-gray-600 text-white rounded-full px-3 py-1 text-sm outline-none w-24"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center border-2 border-dashed border-gray-600 rounded-full px-3 py-1 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add tag
          </button>
        )}
      </div>
    </div>
  );
}
