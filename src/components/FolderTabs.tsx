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
    <div className="w-full overflow-x-auto">
      <div className="flex justify-start md:justify-center space-x-2 px-4 pb-2">
        <button
          onClick={() => onSelectFolder("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all button-text ${
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
            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all button-text ${
              selectedFolder === folder._id
                ? 'bg-[#FF4500] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {folder.name}
          </button>
        ))}
      </div>
    </div>
  );
}
