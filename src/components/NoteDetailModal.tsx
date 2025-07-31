import { useEffect, useRef, useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, ArrowUpRight, ChevronDown, ChevronUp, Minimize2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { EditableTitle } from "./EditableTitle";
import { EditableContent } from "./EditableContent";
import { ActionButtons } from "./ActionButtons";
import { TagManager } from "./TagManager";
import type { Doc } from "../../convex/_generated/dataModel";


interface NoteDetailModalProps {
  note: Doc<"notes">;
  onClose: () => void;
  onAppend: () => void;
}

export function NoteDetailModal({ note, onClose, onAppend }: NoteDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRewriteInput, setShowRewriteInput] = useState(false);
  const [rewriteInstructions, setRewriteInstructions] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const isGenerating = note.status === 'generating' || isRewriting;
  
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.remove);
  const updatePublishStatus = useMutation(api.notes.updatePublishStatus);
  const rewriteContent = useAction(api.ai.rewriteContent);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSaveTitle = async (newTitle: string) => {
    if (newTitle === note.title) return;
    try {
      await updateNote({ id: note._id, title: newTitle });
      toast.success("Title updated");
    } catch (error) {
      toast.error("Failed to update title");
    }
  };

  const handleSaveContent = async (newContent: string) => {
    if (newContent === note.content) return;
    try {
      await updateNote({ id: note._id, content: newContent });
      toast.success("Note content updated");
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const handleUpdateTags = async (newTags: string[]) => {
    try {
      await updateNote({ id: note._id, tags: newTags });
      toast.success("Tags updated");
    } catch (error) {
      toast.error("Failed to update tags");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote({ id: note._id });
        toast.success("Note deleted");
        onClose();
      } catch (error) {
        toast.error("Failed to delete note");
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    toast.success("Note content copied");
  };

  const handlePublish = async () => {
    try {
      const token = await updatePublishStatus({ id: note._id, published: !note.published });
      if (!note.published) {
        const url = `${window.location.origin}/p/${token}`;
        navigator.clipboard.writeText(url);
        toast.success("Note published! URL copied to clipboard.");
      } else {
        toast.success("Note unpublished.");
      }
    } catch (error) {
      toast.error("Failed to update publish status.");
    }
  };

  const handleShare = async () => {
    const shareData: ShareData = {
      title: note.title,
      text: note.content,
    };

    if (note.published && note.publishToken) {
      shareData.url = `${window.location.origin}/p/${note.publishToken}`;
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error("Failed to share note.");
        }
      }
    } else {
      toast.info("Sharing is not supported on your device/browser.");
    }
  };



  const handleRewrite = async () => {
    if (!note.transcript) {
      toast.error("This note has no original transcript to rewrite from.");
      return;
    }
    if (!rewriteInstructions.trim()) {
      toast.error("Please provide instructions for how to rewrite the note.");
      return;
    }
    
    setIsRewriting(true);
    try {
      await rewriteContent({ noteId: note._id, instructions: rewriteInstructions });
      toast.success("Note rewritten successfully!");
      setShowRewriteInput(false);
      setRewriteInstructions("");
    } catch (error) {
      toast.error("AI failed to rewrite content.");
      console.error(error);
    } finally {
      setIsRewriting(false);
    }
  };

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 backdrop-blur-sm animate-in fade-in-0 overflow-y-auto">
      <div className={`min-h-full flex items-center justify-center ${isExpanded ? 'p-0' : 'p-4'}`}>
        <div ref={modalRef} className={`bg-[#343F51] shadow-xl text-white animate-in fade-in-0 zoom-in-95 transition-all duration-300 ${
          isExpanded 
            ? 'w-full h-full min-h-screen p-8' 
            : 'max-w-2xl w-full rounded-lg p-8 my-8'
        }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10">
            {!isExpanded && note.transcript && !showRewriteInput && (
              <button
                onClick={() => setShowRewriteInput(true)}
                className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors"
                title="Rewrite with AI"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
          {isExpanded && <div className="flex-1" />}
          <div className="w-10 text-right">
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
              {isExpanded ? <Minimize2 className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Rewrite Input Interface */}
        {showRewriteInput && !isGenerating && (
          <div className={`mb-6 p-4 bg-gray-800 rounded-lg border border-blue-500 ${isExpanded ? 'max-w-2xl mx-auto' : ''}`}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                How would you like to rewrite this note?
              </label>
              <textarea
                value={rewriteInstructions}
                onChange={(e) => setRewriteInstructions(e.target.value)}
                placeholder="e.g., Make it more formal, convert to bullet points, simplify the language..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isRewriting}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRewriteInput(false);
                  setRewriteInstructions("");
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                disabled={isRewriting}
              >
                Cancel
              </button>
              <button
                onClick={handleRewrite}
                disabled={!rewriteInstructions.trim() || isRewriting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                {isRewriting ? "Rewriting..." : "Rewrite"}
              </button>
            </div>
          </div>
        )}
        
        {/* Rewriting Status */}
        {isGenerating && (
          <div className={`mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500 ${isExpanded ? 'max-w-2xl mx-auto' : ''}`}>
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-blue-300 text-sm">AI is rewriting your note...</span>
            </div>
          </div>
        )}
        
        {/* Content Container - Centered and beautifully spaced */}
        <div className={`mx-auto ${isExpanded ? 'max-w-4xl' : 'w-full'}`}>
          {!isExpanded && <div className="text-center text-gray-400 text-sm mb-6 ui-text">{formatDate(note._creationTime)}</div>}
          
          <div className="text-center mb-6">
            <EditableTitle initialTitle={note.title} onSave={handleSaveTitle} />
          </div>
          
          <div className="mb-8">
            {isGenerating ? (
              <div className="max-w-3xl mx-auto">
                <div className="space-y-4 animate-pulse p-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-700 rounded mx-auto"></div>
                  <div className="h-4 bg-gray-700 rounded mx-auto"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
                {isRewriting && (
                  <div className="text-center mt-4">
                    <p className="text-blue-300 text-sm">Rewriting content based on your instructions...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <EditableContent key={note._id + note.content} initialContent={note.content} onSave={handleSaveContent} />
              </div>
            )}
            
            {note.transcript && (
              <div className="mt-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <button 
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors mx-auto button-text"
                  >
                    <span>{showTranscript ? "Hide" : "View"} Original Transcript</span>
                    {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {showTranscript && (
                  <div className="mt-4 p-6 bg-gray-800 rounded-lg text-gray-300 text-sm whitespace-pre-wrap animate-in fade-in-0 note-text">
                    {note.transcript}
                  </div>
                )}
              </div>
            )}

            {!isExpanded && (
              <div className="mt-8">
                <TagManager initialTags={note.tags || []} onUpdateTags={handleUpdateTags} />
              </div>
            )}
          </div>
        </div>
        
        {!isExpanded && <ActionButtons onDelete={handleDelete} onCopy={handleCopy} onAppend={onAppend} onPublish={handlePublish} onShare={handleShare} isPublished={!!note.published} />}
        </div>
      </div>
    </div>
  );
}
