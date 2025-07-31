import { Wand2 } from "lucide-react";

interface CreateWithAIDropdownProps {
  onSelectStyle: (style: string) => void;
}

export function CreateWithAIDropdown({ onSelectStyle }: CreateWithAIDropdownProps) {
  const handleRewrite = () => {
    onSelectStyle("default");
  };

  return (
    <button
      type="button"
      onClick={handleRewrite}
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
      title="Rewrite with AI"
    >
      <Wand2 className="w-5 h-5 mr-2" />
      <span>Rewrite with AI</span>
    </button>
  );
}
