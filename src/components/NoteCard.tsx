import { Clock, Volume2, Folder, CheckCircle } from "lucide-react";
import type { Doc } from "../../convex/_generated/dataModel";

interface NoteCardProps {
  note: Doc<"notes">;
  folderName?: string;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, folderName, isSelected, onSelect, onClick }: NoteCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border group relative flex flex-col ${
        isSelected ? 'ring-2 ring-slate-700 border-slate-700' : ''
      }`}
    >
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-8">
            <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 heading text-base sm:text-lg">
              {note.title}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500 ui-text">
              {folderName && (
                <div className="flex items-center space-x-1">
                  <Folder className="w-3 h-3" />
                  <span>{folderName}</span>
                </div>
              )}
              {note.audioUrl && (
                <div className="flex items-center space-x-1">
                  <Volume2 className="w-3 h-3" />
                  {note.duration !== undefined && <span>{formatDuration(note.duration)}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-4 mb-4 flex-grow note-text">
          {note.content}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full ui-text">
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs rounded-full ui-text">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto ui-text">
          <div className="flex items-center">
            <span>{formatDate(note._creationTime)}</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="p-1"
        >
          {isSelected ? (
            <CheckCircle className="w-5 h-5 text-slate-700 fill-white" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />
          )}
        </button>
      </div>
    </div>
  );
}
