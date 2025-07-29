import { useState, useRef, useEffect } from "react";
import { Wand2, ChevronDown } from "lucide-react";

const styles = [
  "Meeting Summary",
  "Blog Post",
  "To-Do List",
  "Email Draft",
  "Social Media Post",
  "Meeting Minutes",
  "Journal Entry",
  "Article Outline",
  "Video Script",
  "Project Brief",
  "Study Notes",
  "Twitter Thread",
  "Presentation Outline",
  "Daily Schedule",
  "Shopping/Task List",
];

interface CreateWithAIDropdownProps {
  onSelectStyle: (style: string) => void;
}

export function CreateWithAIDropdown({ onSelectStyle }: CreateWithAIDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (style: string) => {
    onSelectStyle(style);
    setIsOpen(false);
  };

  const handleCustomStyle = () => {
    const customStyle = prompt("Enter your custom style prompt:");
    if (customStyle) {
      handleSelect(customStyle);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          title="Create with AI"
        >
          <Wand2 className="w-5 h-5 mr-2" />
          <span>Create with AI</span>
          <ChevronDown className="w-5 h-5 ml-2 -mr-1" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-[#2a2a2a] ring-1 ring-black ring-opacity-5 z-10 animate-in fade-in-0 zoom-in-95">
          <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
            {styles.map((style) => (
              <a
                key={style}
                href="#"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(style);
                }}
              >
                {style}
              </a>
            ))}
            <div className="border-t border-gray-700 my-1"></div>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                handleCustomStyle();
              }}
            >
              + Custom Style
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
