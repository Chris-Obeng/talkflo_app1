import { useState, useEffect, useRef } from "react";
import { SignOutButton } from "../SignOutButton";
import { User, Settings } from "lucide-react";

interface HeaderProps {
  user: any;
}

export function Header({ user }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Left: Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <User className="w-6 h-6 text-gray-600" />
          </button>

          {isProfileOpen && (
            <div 
              className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 p-2"
            >
              <div className="p-2 border-b mb-2">
                <p className="font-semibold text-gray-800 truncate ui-text">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500 truncate ui-text">{user?.email}</p>
              </div>
              <div className="p-1">
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md button-text">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span>Settings</span>
                </button>
              </div>
              <div className="p-1">
                <SignOutButton />
              </div>
            </div>
          )}
        </div>

        {/* Center: Empty space (title removed) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        </div>

        {/* Right: Spacer to balance for centering */}
        <div className="w-10 h-10" />
      </div>
    </header>
  );
}
