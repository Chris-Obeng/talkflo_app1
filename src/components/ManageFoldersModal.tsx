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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Manage Folders</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-gray-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Folder */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Create a new folder..."
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
            <button 
              onClick={handleCreateFolder} 
              className="p-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:opacity-50 transition-colors"
              disabled={!newFolderName.trim()}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Folder List */}
        <div className="p-4 max-h-64 overflow-y-auto">
          {folders.map((folder) => (
            <div key={folder._id} className="flex items-center justify-between group p-2 rounded-md hover:bg-slate-700">
              {editingFolder?._id === folder._id ? (
                <div className="flex items-center space-x-2 flex-1">
                  <Folder className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={renamingText}
                    onChange={(e) => setRenamingText(e.target.value)}
                    className="w-full bg-transparent border-b border-slate-600 text-white focus:outline-none focus:border-slate-400"
                    autoFocus
                  />
                  <button onClick={handleRenameFolder} className="p-1 text-emerald-400 hover:bg-emerald-900 rounded-full transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Folder className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200">{folder.name}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                    <button 
                      onClick={() => {
                        setEditingFolder(folder);
                        setRenamingText(folder.name);
                      }}
                      className="p-1 hover:bg-slate-600 rounded-full transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-300" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFolder(folder._id)}
                      className="p-1 text-red-400 hover:bg-red-900 rounded-full transition-colors"
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
  );
}
