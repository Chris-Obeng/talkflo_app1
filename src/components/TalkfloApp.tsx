import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
import { FolderKanban, User, Settings, Crown } from "lucide-react";
import { FloatingUploadButton } from "./FloatingUploadButton";
import { Spinner } from "./ui/ios-spinner";
import { SignOutButton } from "../SignOutButton";
import SubscriptionModal from "./SubscriptionModal";

export function TalkfloApp() {
  const [selectedFolder, setSelectedFolder] = useState<Id<"folders"> | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecording, setShowRecording] = useState(false);
  const [showManageFolders, setShowManageFolders] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Id<"notes">[]>([]);
  const [noteToAppendTo, setNoteToAppendTo] = useState<Doc<"notes"> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const subscription = useQuery(api.dodoPayments.getSubscription);
  const folders = useQuery(api.folders.list);
  const notes = useQuery(api.notes.list, {
    folderId: selectedFolder === "all" ? undefined : selectedFolder,
    search: searchQuery || undefined
  });
  const deleteBatch = useMutation(api.notes.removeBatch);

  // Check if user has an active subscription
  const hasActiveSubscription = subscription?.status === "active" && subscription?.endsOn > Date.now();

  useEffect(() => {
    if (showRecording) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showRecording]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSelectNote = (noteId: Id<"notes">) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleClearSelection = () => setSelectedNotes([]);

  const handleDeleteSelected = () => {
    if (selectedNotes.length === 0) return;
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBatch({ ids: selectedNotes });
      handleClearSelection();
      setShowDeleteConfirmation(false);
    } catch (error) {
      toast.error("Failed to delete notes.");
      console.error(error);
      setShowDeleteConfirmation(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleStartAppend = (note: Doc<"notes">) => {
    setNoteToAppendTo(note);
    setShowRecording(true);
  };

  const handleStartRecording = () => {
    setShowRecording(true);
  };

  const handleCloseRecordingWidget = () => {
    setShowRecording(false);
    setNoteToAppendTo(null);
  };

  const handleOpenSubscriptionModal = () => {
    setShowSubscriptionModal(true);
    setIsProfileOpen(false);
  };

  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionModal(false);
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

      {/* Profile section right below header */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/50 transition-colors"
            >
              <User className="w-6 h-6 text-gray-600" />
            </button>

            {isProfileOpen && (
              <div
                className="absolute left-0 mt-2 w-screen max-w-xs sm:w-64 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 z-50"
                style={{
                  transform: 'translateX(calc(-50% + 20px)) sm:translateX(0)',
                }}
              >
                <div className="p-3 border-b border-gray-200 mb-2">
                  <p className="font-semibold text-gray-800 truncate ui-text">{loggedInUser?.name || 'User'}</p>
                  <p className="text-sm text-gray-500 truncate ui-text">{loggedInUser?.email}</p>
                  {hasActiveSubscription && (
                    <div className="flex items-center mt-2">
                      <Crown className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-xs text-orange-600 font-medium">Premium Member</span>
                    </div>
                  )}
                </div>
                <div className="p-1">
                  <Link
                    to="/settings"
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg button-text"
                  >
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span>Settings</span>
                  </Link>
                </div>
                <div className="p-1">
                  <button 
                    onClick={handleOpenSubscriptionModal}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg button-text"
                  >
                    <User className="w-5 h-5 text-gray-500" />
                    <span>{hasActiveSubscription ? "Manage Subscription" : "Subscription"}</span>
                  </button>
                </div>
                <div className="p-1 mt-1">
                  <SignOutButton />
                </div>
              </div>
            )}
          </div>

          {hasActiveSubscription ? (
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-600">Premium</span>
            </div>
          ) : (
            <button 
              onClick={handleOpenSubscriptionModal}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium text-gray-700 mb-3 sm:mb-4 tracking-normal">
            Talkflo
            <span className="block w-12 sm:w-16 h-1 bg-primary rounded-full mt-2 sm:mt-3 mx-auto"></span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 ui-text">
            Record your thoughts and let AI transform them into organized notes
          </p>
          {!hasActiveSubscription && (
            <div className="mb-6">
              <button
                onClick={handleOpenSubscriptionModal}
                className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                <Crown className="w-5 h-5" />
                <span>Upgrade to Premium</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">Unlock unlimited recordings and AI features</p>
            </div>
          )}
        </div>

        {showRecording && (
          <div className="mb-8 sm:mb-12">
            <RecordingWidget
              onClose={handleCloseRecordingWidget}
              folderId={selectedFolder === "all" ? undefined : selectedFolder}
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Notes</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedNotes.length} note{selectedNotes.length !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={handleCloseSubscriptionModal} 
      />
    </div>
  );
}
