import { Trash2, X } from "lucide-react";

interface SelectionActionBarProps {
  count: number;
  onClear: () => void;
  onDelete: () => void;
}

export function SelectionActionBar({ count, onClear, onDelete }: SelectionActionBarProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-auto bg-white rounded-full shadow-lg z-40 flex items-center p-2 space-x-4">
      <span className="font-semibold text-gray-700 pl-4">{count} selected</span>
      <button
        onClick={onDelete}
        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
      >
        <Trash2 className="w-5 h-5" />
        <span>Delete</span>
      </button>
      <button
        onClick={onClear}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
