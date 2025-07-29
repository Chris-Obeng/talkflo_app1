import { useState, useRef, useEffect } from "react";
import { Folder, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface Folder {
  _id: Id<"folders">;
  name: string;
}

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolder: Id<"folders"> | null;
  onSelectFolder: (folderId: Id<"folders"> | null) => void;
}

export function FolderSidebar({ folders, selectedFolder, onSelectFolder }: FolderSidebarProps) {
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [renamingText, setRenamingText] = useState("");
  const [menuOpen, setMenuOpen] = useState<Id<"folders"> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const createFolder = useMutation(api.folders.create);
  const updateFolder = useMutation(api.folders.update);
  const deleteFolder = useMutation(api.folders.remove);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleCreateFolder = async () => {
    if (newFolderName.trim() !== "") {
      await createFolder({ name: newFolderName.trim() });
      setNewFolderName("");
    }
  };

  const handleRenameFolder = async () => {
    if (editingFolder && renamingText.trim() !== "") {
      await updateFolder({ id: editingFolder._id, name: renamingText.trim() });
      setEditingFolder(null);
      setRenamingText("");
    }
  };

  const handleDeleteFolder = async (folderId: Id<"folders">) => {
    if (confirm("Are you sure you want to delete this folder? Notes in this folder will not be deleted.")) {
      await deleteFolder({ id: folderId });
      setMenuOpen(null);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4">Folders</h2>
      <div className="flex-1">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left ${
            selectedFolder === null ? "bg-gray-100" : "hover:bg-gray-50"
          }`}
        >
          <Folder className="w-5 h-5" />
          <span>All Notes</span>
        </button>
        {folders.map((folder) => (
          <div key={folder._id} className="group relative">
            {editingFolder?._id === folder._id ? (
              <div className="flex items-center space-x-2 p-2">
                <input
                  type="text"
                  value={renamingText}
                  onChange={(e) => setRenamingText(e.target.value)}
                  onBlur={handleRenameFolder}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
                  className="w-full border-b focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => onSelectFolder(folder._id)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left ${
                  selectedFolder === folder._id ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <Folder className="w-5 h-5" />
                <span className="flex-1 truncate">{folder.name}</span>
                <div className="opacity-0 group-hover:opacity-100 relative">
                  <MoreHorizontal 
                    className="w-5 h-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(folder._id);
                    }}
                  />
                  {menuOpen === folder._id && (
                    <div 
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border"
                    >
                      <button
                        onClick={() => {
                          setEditingFolder(folder);
                          setRenamingText(folder.name);
                          setMenuOpen(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" /> Rename
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder._id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            placeholder="New folder name..."
            className="w-full border-b focus:outline-none focus:border-blue-500"
          />
          <button onClick={handleCreateFolder} className="p-2 hover:bg-gray-100 rounded-md">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
