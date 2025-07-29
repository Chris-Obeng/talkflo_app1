import { FolderPlus } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

interface Folder {
  _id: Id<"folders">;
  name: string;
}

interface FolderTabsProps {
  folders: Folder[];
  selectedFolder: Id<"folders"> | "all";
  onSelectFolder: (folderId: Id<"folders"> | "all") => void;
}

export function FolderTabs({ folders, selectedFolder, onSelectFolder }: FolderTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center items-center">
      <button
        onClick={() => onSelectFolder("all")}
        className={`px-6 py-2 rounded-full font-medium transition-all button-text ${
          selectedFolder === "all"
            ? 'bg-[#FF4500] text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        }`}
      >
        All Notes
      </button>
      {folders.map((folder) => (
        <button
          key={folder._id}
          onClick={() => onSelectFolder(folder._id)}
          className={`px-6 py-2 rounded-full font-medium transition-all button-text ${
            selectedFolder === folder._id
              ? 'bg-[#FF4500] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          {folder.name}
        </button>
      ))}
    </div>
  );
}
