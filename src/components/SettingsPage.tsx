import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { Spinner } from './ui/ios-spinner';

const languages = [
  "English", "Spanish", "French", "German", "Mandarin", "Hindi",
  "Arabic", "Portuguese", "Bengali", "Russian", "Japanese", "Korean"
];

type WritingLength = "short" | "medium" | "long";

interface LocalSettings {
  inputLanguage: string;
  outputLanguage: string;
  writingStyle: string;
  writingLength: WritingLength;
}

type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

const SettingsPage: React.FC = () => {
  const serverSettings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);

  const [localSettings, setLocalSettings] = useState<LocalSettings | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (serverSettings && localSettings === null) {
      setLocalSettings({
        inputLanguage: serverSettings.inputLanguage ?? 'Auto Detect',
        outputLanguage: serverSettings.outputLanguage ?? 'English',
        writingStyle: serverSettings.writingStyle ?? '',
        writingLength: serverSettings.writingLength ?? 'medium',
      });
    }
  }, [serverSettings, localSettings]);

  const handleSettingsChange = useCallback((update: Partial<LocalSettings>) => {
    if (!localSettings) return;

    const newSettings = { ...localSettings, ...update };
    setLocalSettings(newSettings);
    setSyncStatus('saving');

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        await updateSettings(newSettings);
        setSyncStatus('saved');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (error) {
        setSyncStatus('error');
        toast.error('Failed to save settings.');
        console.error(error);
      }
    }, 1000);
  }, [localSettings, updateSettings]);

  if (localSettings === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-100 to-stone-50">
        <Spinner size="lg" className="text-primary w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app" className="p-2 rounded-full text-gray-600 hover:bg-white/60 hover:text-primary transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-serif font-medium text-gray-700 tracking-normal">Settings</h1>
          </div>
          <div className="flex items-center gap-2 text-gray-500 transition-opacity duration-300">
            {syncStatus === 'saving' && <><Spinner size="sm" /><span>Saving...</span></>}
            {syncStatus === 'saved' && <><CheckCircle className="text-green-500" /><span>Saved</span></>}
            {syncStatus === 'error' && <span className="text-red-500">Error saving</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200/80">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Language</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="input-language" className="block text-sm font-medium text-gray-700 mb-2">Input Language</label>
                  <select
                    id="input-language"
                    value={localSettings.inputLanguage}
                    onChange={(e) => handleSettingsChange({ inputLanguage: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  >
                    <option value="Auto Detect">Auto Detect</option>
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="output-language" className="block text-sm font-medium text-gray-700 mb-2">Output Language</label>
                  <select
                    id="output-language"
                    value={localSettings.outputLanguage}
                    onChange={(e) => handleSettingsChange({ outputLanguage: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  >
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200/80">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Writing Style</h2>
              <div>
                <textarea
                  id="writing-style"
                  rows={5}
                  value={localSettings.writingStyle}
                  onChange={(e) => handleSettingsChange({ writingStyle: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  placeholder="Describe a style you want Talkflo to write in"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200/80">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">AI Writing Length</h2>
              <div className="space-y-4">
                {(['short', 'medium', 'long'] as WritingLength[]).map(length => (
                  <div key={length} className="flex items-center">
                    <input
                      id={`length-${length}`}
                      name="writing-length"
                      type="radio"
                      value={length}
                      checked={localSettings.writingLength === length}
                      onChange={() => handleSettingsChange({ writingLength: length })}
                      className="focus:ring-primary h-5 w-5 text-primary border-gray-300"
                    />
                    <label htmlFor={`length-${length}`} className="ml-3 block text-sm font-medium text-gray-700 capitalize">{length}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;