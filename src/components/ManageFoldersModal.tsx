import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Plus, Edit, Trash2, Check, Folder } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

interface Folder {
  _id: Id<"folders">;
  name: string;
}

interface ManageFoldersModalProps {
  folders: Folder[];
  onClose: () => void;
}

export function ManageFoldersModal({ folders, onClose }: ManageFoldersModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [renamingText, setRenamingText] = useState("");

  const createFolder = useMutation(api.folders.create);
  const updateFolder = useMutation(api.folders.update);
  const deleteFolder = useMutation(api.folders.remove);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Manage Folders</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Add New Folder */}
        <div className="p-5">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Create a new folder..."
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <button 
              onClick={handleCreateFolder} 
              className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={!newFolderName.trim()}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Folder List */}
        <div className="px-5 pb-5 max-h-72 overflow-y-auto">
          <div className="space-y-2">
            {folders.map((folder) => (
              <div key={folder._id} className="flex items-center justify-between group p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                {editingFolder?._id === folder._id ? (
                  <div className="flex items-center gap-3 flex-1">
                    <Folder className="w-5 h-5 text-indigo-500" />
                    <input
                      type="text"
                      value={renamingText}
                      onChange={(e) => setRenamingText(e.target.value)}
                      className="w-full bg-transparent text-gray-900 dark:text-white focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
                    />
                    <button onClick={handleRenameFolder} className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full transition-colors">
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Folder className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{folder.name}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingFolder(folder);
                          setRenamingText(folder.name);
                        }}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteFolder(folder._id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
