import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { NoteDetailModal } from "./NoteDetailModal";
import { Calendar, Folder, MoreVertical, Trash2 } from "lucide-react";
import type { Id, Doc } from "../../convex/_generated/dataModel";

interface Folder {
  _id: Id<"folders">;
  name: string;
}

interface NotesListProps {
  notes: Doc<"notes">[];
  folders: Folder[];
  selectedNotes: Id<"notes">[];
  onSelectNote: (noteId: Id<"notes">) => void;
  onAppendToNote: (note: Doc<"notes">) => void;
  actionButtons?: React.ReactNode;
}

export function NotesList({ notes, folders, selectedNotes, onSelectNote, onAppendToNote, actionButtons }: NotesListProps) {
  const [selectedNote, setSelectedNote] = useState<Doc<"notes"> | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<Id<"notes"> | null>(null);
  const deleteNote = useMutation(api.notes.remove);

  const handleDeleteNote = async (noteId: Id<"notes">) => {
    try {
      await deleteNote({ id: noteId });
      setDropdownOpen(null);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No notes yet</h3>
        <p className="text-gray-600">Start recording to create your first note</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {actionButtons && (
          <div className="mb-6">
            {actionButtons}
          </div>
        )}
        <div className="space-y-2">
          {notes.map((note) => {
            const folderName = folders.find(f => f._id === note.folderId)?.name;
            const isSelected = selectedNotes.includes(note._id);

            return (
              <div
                key={note._id}
                className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-md ${isSelected
                  ? "border-[#FF4500] shadow-md ring-2 ring-[#FF4500]/20"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => selectedNotes.length > 0 ? onSelectNote(note._id) : setSelectedNote(note)}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        {selectedNotes.length > 0 && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelectNote(note._id)}
                            className="w-4 h-4 text-[#FF4500] border-gray-300 rounded focus:ring-[#FF4500]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 heading">
                          {note.title || "Untitled Note"}
                        </h3>
                      </div>

                      <p className="text-gray-600 mb-2 line-clamp-2 note-text">
                        {truncateText(note.content || "", 200)}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 ui-text">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(note._creationTime)}</span>
                        </div>
                        {folderName && (
                          <div className="flex items-center gap-1">
                            <Folder size={14} />
                            <span>{folderName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(dropdownOpen === note._id ? null : note._id);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {dropdownOpen === note._id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppendToNote(note);
                              setDropdownOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors button-text"
                          >
                            Append to note
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note._id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 button-text"
                          >
                            <Trash2 size={14} />
                            Delete note
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedNote && (
        <NoteDetailModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onAppend={() => {
            onAppendToNote(selectedNote);
            setSelectedNote(null);
          }}
        />
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </>
  );
}