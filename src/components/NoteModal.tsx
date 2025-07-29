import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Edit3, Save, Volume2, Download, Folder } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

interface Note {
  _id: Id<"notes">;
  title: string;
  content: string;
  folderId?: Id<"folders">;
  _creationTime: number;
  duration?: number;
  audioUrl?: Id<"_storage">;
  transcript?: string;
}

interface Folder {
  _id: Id<"folders">;
  name: string;
}

interface NoteModalProps {
  note: Note;
  folders: Folder[];
  onClose: () => void;
}

export function NoteModal({ note, folders, onClose }: NoteModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [editedFolderId, setEditedFolderId] = useState<Id<"folders"> | null>(note.folderId ?? null);
  const [showTranscript, setShowTranscript] = useState(false);

  const updateNote = useMutation(api.notes.update);

  const handleSave = async () => {
    try {
      await updateNote({
        id: note._id,
        title: editedTitle,
        content: editedContent,
        folderId: editedFolderId ?? undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleExport = () => {
    const exportContent = `# ${editedTitle}\n\n${editedContent}\n\n---\nCreated: ${new Date(note._creationTime).toLocaleString()}`;
    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editedTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-xl font-semibold text-gray-800 bg-transparent border-b border-gray-300 focus:border-[#FF4500] outline-none"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-800">{editedTitle}</h2>
            )}
            {isEditing ? (
              <select
                value={editedFolderId ?? ""}
                onChange={(e) => setEditedFolderId(e.target.value ? (e.target.value as Id<"folders">) : null)}
                className="px-3 py-1 bg-gray-100 text-sm rounded-full"
              >
                <option value="">Uncategorized</option>
                {folders.map(folder => (
                  <option key={folder._id} value={folder._id}>{folder.name}</option>
                ))}
              </select>
            ) : (
              <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                {folders.find(f => f._id === editedFolderId)?.name || "Uncategorized"}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {note.audioUrl && (
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="p-2 text-gray-600 hover:text-[#FF4500] transition-colors"
                title="Toggle transcript"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleExport}
              className="p-2 text-gray-600 hover:text-[#FF4500] transition-colors"
              title="Export note"
            >
              <Download className="w-5 h-5" />
            </button>
            {isEditing ? (
              <button
                onClick={handleSave}
                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                title="Save changes"
              >
                <Save className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:text-[#FF4500] transition-colors"
                title="Edit note"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
            <span>{formatDate(note._creationTime)}</span>
            {note.duration && (
              <span className="flex items-center space-x-1">
                <Volume2 className="w-4 h-4" />
                <span>{formatDuration(note.duration)}</span>
              </span>
            )}
          </div>

          {/* Main Content */}
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] outline-none resize-none"
              placeholder="Write your note content here..."
            />
          ) : (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {editedContent}
              </div>
            </div>
          )}

          {/* Transcript Section */}
          {showTranscript && note.transcript && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Original Transcript</h3>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {note.transcript}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedTitle(note.title);
                setEditedContent(note.content);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#FF4500] text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
