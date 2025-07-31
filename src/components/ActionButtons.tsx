import { Trash2, Copy, Upload, Share2, Mic } from "lucide-react";

interface ActionButtonsProps {
  onDelete: () => void;
  onCopy: () => void;
  onAppend: () => void;
  onPublish: () => void;
  onShare: () => void;
  isPublished: boolean;
}

export function ActionButtons({ onDelete, onCopy, onAppend, onPublish, onShare, isPublished }: ActionButtonsProps) {
  return (
    <>
      <div className="mt-8 flex justify-center">
        <button 
          onClick={onAppend}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 button-text"
        >
          <Mic className="w-4 h-4" />
          <span>Append</span>
        </button>
      </div>
      <div className="mt-auto pt-6 flex items-center justify-center space-x-8 text-gray-400">
        <button onClick={onDelete} className="flex flex-col items-center hover:text-white transition-colors button-text" title="Delete">
          <Trash2 className="w-6 h-6" />
          <span className="text-xs mt-1">Delete</span>
        </button>
        <button onClick={onCopy} className="flex flex-col items-center hover:text-white transition-colors button-text" title="Copy">
          <Copy className="w-6 h-6" />
          <span className="text-xs mt-1">Copy</span>
        </button>
        <button onClick={onPublish} className={`flex flex-col items-center transition-colors button-text ${isPublished ? 'text-orange-400 hover:text-orange-300' : 'hover:text-white'}`} title={isPublished ? "Unpublish" : "Publish"}>
          <Upload className="w-6 h-6" />
          <span className="text-xs mt-1">{isPublished ? "Unpublish" : "Publish"}</span>
        </button>
        <button onClick={onShare} className="flex flex-col items-center hover:text-white transition-colors button-text" title="Share">
          <Share2 className="w-6 h-6" />
          <span className="text-xs mt-1">Share</span>
        </button>
      </div>
    </>
  );
}
