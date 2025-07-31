import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Header } from "./Header";
import { RecordingWidget } from "./RecordingWidget";
import { NotesGrid } from "./NotesGrid";
import { SearchBar } from "./SearchBar";
import { FloatingRecordButton } from "./FloatingRecordButton";
import { FolderTabs } from "./FolderTabs";
import { ManageFoldersModal } from "./ManageFoldersModal";
import { SelectionActionBar } from "./SelectionActionBar";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import type { Id, Doc } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { FolderKanban } from "lucide-react";
import { FloatingUploadButton } from "./FloatingUploadButton";
import { Spinner } from "./ui/ios-spinner";

export function TalkfloApp() {
  const [selectedFolder, setSelectedFolder] = useState<Id<"folders"> | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecording, setShowRecording] = useState(false);
  const [showManageFolders, setShowManageFolders] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Id<"notes">[]>([]);
  const [noteToAppendTo, setNoteToAppendTo] = useState<Doc<"notes"> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  const recordingWidgetRef = useRef<HTMLDivElement>(null);

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const folders = useQuery(api.folders.list);
  const notes = useQuery(api.notes.list, { 
    folderId: selectedFolder === "all" ? undefined : selectedFolder,
    search: searchQuery || undefined 
  });
  const deleteBatch = useMutation(api.notes.removeBatch);

  const handleSelectNote = (noteId: Id<"notes">) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleClearSelection = () => setSelectedNotes([]);

  const handleDeleteSelected = async () => {
    if (selectedNotes.length === 0) return;
    try {
      await deleteBatch({ ids: selectedNotes });
      toast.success(`${selectedNotes.length} note(s) deleted.`);
      handleClearSelection();
    } catch (error) {
      toast.error("Failed to delete notes.");
      console.error(error);
    }
  };

  const handleStartAppend = (note: Doc<"notes">) => {
    setNoteToAppendTo(note);
    setShowRecording(true);
    // Scroll to recording widget after state update
    setTimeout(() => {
      recordingWidgetRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
  };

  const handleStartRecording = () => {
    setShowRecording(true);
    // Scroll to recording widget after state update
    setTimeout(() => {
      recordingWidgetRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
  };

  const handleCloseRecordingWidget = () => {
    setShowRecording(false);
    setNoteToAppendTo(null);
  };

  if (loggedInUser === undefined || folders === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-100 to-stone-50">
        <Spinner size="lg" className="text-primary w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-50 flex flex-col">
      <Header user={loggedInUser} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium text-gray-700 mb-3 sm:mb-4 tracking-normal">
            Talkflo
            <span className="block w-12 sm:w-16 h-1 bg-primary rounded-full mt-2 sm:mt-3 mx-auto"></span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 ui-text">
            Record your thoughts and let AI transform them into organized notes
          </p>
        </div>

        {showRecording && (
          <div ref={recordingWidgetRef} className="mb-12">
            <RecordingWidget
              onClose={handleCloseRecordingWidget}
              noteToAppendTo={noteToAppendTo ?? undefined}
            />
          </div>
        )}

        <div className="mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search your notes..." />
        </div>

        <div className="mb-8">
          <FolderTabs folders={folders || []} selectedFolder={selectedFolder} onSelectFolder={setSelectedFolder} />
        </div>

        <NotesGrid 
          notes={notes || []} 
          folders={folders || []}
          selectedNotes={selectedNotes}
          onSelectNote={handleSelectNote}
          onAppendToNote={handleStartAppend}
          viewMode={viewMode}
          actionButtons={
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowManageFolders(true)}
                  className="inline-flex items-center justify-center font-medium text-gray-600 transition-all"
                  title="Manage Folders"
                >
                  <FolderKanban className="w-5 h-5" />
                </button>
                <FloatingUploadButton folderId={selectedFolder === "all" ? undefined : selectedFolder} />
              </div>
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          }
        />

        {selectedNotes.length > 0 ? (
          <SelectionActionBar count={selectedNotes.length} onClear={handleClearSelection} onDelete={handleDeleteSelected} />
        ) : (
          !showRecording && 
          <FloatingRecordButton onClick={handleStartRecording} />
        )}
      </main>

      {showManageFolders && (
        <ManageFoldersModal folders={folders || []} onClose={() => setShowManageFolders(false)} />
      )}
    </div>
  );
}
