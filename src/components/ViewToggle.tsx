import { Grid3X3, List } from "lucide-react";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center space-x-2">
      <button
        onClick={() => onViewModeChange("grid")}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 ${
          viewMode === "grid"
            ? "text-orange-500"
            : "text-gray-400 hover:text-gray-600"
        }`}
        title="Grid view"
      >
        <Grid3X3 size={20} />
      </button>
      <button
        onClick={() => onViewModeChange("list")}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 ${
          viewMode === "list"
            ? "text-orange-500"
            : "text-gray-400 hover:text-gray-600"
        }`}
        title="List view"
      >
        <List size={20} />
      </button>
    </div>
  );
}
