import { Mic } from "lucide-react";

interface FloatingRecordButtonProps {
  onClick: () => void;
}

export function FloatingRecordButton({ onClick }: FloatingRecordButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
      title="Start recording"
    >
      <Mic className="w-10 h-10" />
    </button>
  );
}
