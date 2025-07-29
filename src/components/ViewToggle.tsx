import { Grid3X3, List } from "lucide-react";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center bg-white rounded-lg border border-gray-200 shadow-sm p-0.5">
      <button
        onClick={() => onViewModeChange("grid")}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
          viewMode === "grid"
            ? "bg-[#FF4500] text-white shadow-sm transform scale-105"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
        title="Grid view"
      >
        <Grid3X3 size={16} />
      </button>
      <button
        onClick={() => onViewModeChange("list")}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
          viewMode === "list"
            ? "bg-[#FF4500] text-white shadow-sm transform scale-105"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
        title="List view"
      >
        <List size={16} />
      </button>
    </div>
  );
}