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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Note Not Found</h1>
          <p className="text-gray-600">This note is either private or does not exist.</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-stone-100 font-serif">
      <main className="max-w-3xl mx-auto px-4 py-16">
        <article>
          <header className="text-center mb-12">
            <p className="text-gray-500 mb-2">{formatDate(note._creationTime)}</p>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">{note.title}</h1>
          </header>
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
            {note.content}
          </div>
        </article>
      </main>
      <footer className="text-center py-8 text-gray-500">
        <p>Published with Talkflo</p>
      </footer>
    </div>
  );
}
