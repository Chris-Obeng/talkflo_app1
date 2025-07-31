import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { NoteCard } from "./NoteCard";
import { NoteDetailModal } from "./NoteDetailModal";
import { NotesList } from "./NotesList";
import type { Id, Doc } from "../../convex/_generated/dataModel";
import type { ViewMode } from "./ViewToggle";
import Masonry from "react-masonry-css";

interface Folder {
  _id: Id<"folders">;
  name: string;
}

interface NotesGridProps {
  notes: Doc<"notes">[];
  folders: Folder[];
  selectedNotes: Id<"notes">[];
  onSelectNote: (noteId: Id<"notes">) => void;
  onAppendToNote: (note: Doc<"notes">) => void;
  viewMode: ViewMode;
  actionButtons?: React.ReactNode;
}

export function NotesGrid({ notes, folders, selectedNotes, onSelectNote, onAppendToNote, viewMode, actionButtons }: NotesGridProps) {
  const [selectedNote, setSelectedNote] = useState<Doc<"notes"> | null>(null);
  const deleteNote = useMutation(api.notes.remove);

  const handleDeleteNote = async (noteId: Id<"notes">) => {
    try {
      await deleteNote({ id: noteId });
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Render list view
  if (viewMode === "list") {
    return (
      <NotesList
        notes={notes}
        folders={folders}
        selectedNotes={selectedNotes}
        onSelectNote={onSelectNote}
        onAppendToNote={onAppendToNote}
        actionButtons={actionButtons}
      />
    );
  }

  // Render grid view (default)
  if (notes.length === 0) {
    return (
      <>
        {actionButtons && (
          <div className="mb-6">
            {actionButtons}
          </div>
        )}
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No notes yet</h3>
          <p className="text-gray-600">Start recording to create your first note</p>
        </div>
      </>
    );
  }

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <>
      {actionButtons && (
        <div className="mb-6">
          {actionButtons}
        </div>
      )}
      
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            folderName={folders.find((f) => f._id === note.folderId)?.name}
            isSelected={selectedNotes.includes(note._id)}
            onSelect={() => onSelectNote(note._id)}
            onClick={() =>
              selectedNotes.length > 0
                ? onSelectNote(note._id)
                : setSelectedNote(note)
            }
            onDelete={() => handleDeleteNote(note._id)}
          />
        ))}
      </Masonry>

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
    </>
  );
}
