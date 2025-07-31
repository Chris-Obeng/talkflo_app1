import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Spinner } from "./ui/ios-spinner";

export function PublishedNotePage() {
  const { token } = useParams<{ token: string }>();
  const note = useQuery(api.notes.getPublished, token ? { token } : "skip");

  if (note === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" className="text-orange-500" />
      </div>
    );
  }

  if (note === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">Note Not Found</h1>
          <p className="text-gray-600 text-sm sm:text-base">This note is either private or does not exist.</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-stone-100 font-serif">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <article>
          <header className="text-center mb-8 sm:mb-12">
            <p className="text-gray-500 mb-2 text-sm sm:text-base">{formatDate(note._creationTime)}</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight px-2 sm:px-0">
              {note.title}
            </h1>
          </header>
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
            <div className="text-base sm:text-lg leading-relaxed">
              {note.content}
            </div>
          </div>
        </article>
      </main>
      <footer className="text-center py-6 sm:py-8 text-gray-500 px-4">
        <p className="text-sm sm:text-base">Published with Talkflo</p>
      </footer>
    </div>
  );
}
