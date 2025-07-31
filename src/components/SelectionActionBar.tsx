import { Trash2 } from "lucide-react";

interface SelectionActionBarProps {
  count: number;
  onClear: () => void;
  onDelete: () => void;
}

export function SelectionActionBar({ count, onClear, onDelete }: SelectionActionBarProps) {
  return (
    <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-auto bg-white rounded-full shadow-lg z-40 flex items-center p-1.5 sm:p-2 space-x-2 sm:space-x-3 mx-4">
      <button
        onClick={onDelete}
        className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:bg-red-600 transition-colors touch-manipulation"
      >
        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">Delete</span>
      </button>
      <button
        onClick={onClear}
        className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-500 hover:bg-gray-100 active:bg-gray-100 rounded-full transition-colors touch-manipulation text-sm sm:text-base"
      >
        Clear
      </button>
    </div>
  );
}
