import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader, XCircle } from "lucide-react";
import { Spinner } from "./ui/ios-spinner";

export function ProcessingStatus() {
  const recentRecordings = useQuery(api.storage.getRecentRecordings);

  const processingRecordings = recentRecordings?.filter(
    (r) => r.status === "processing" || r.status === "failed"
  );

  if (!processingRecordings || processingRecordings.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 max-w-2xl mx-auto">
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
        <h3 className="text-md font-semibold text-gray-700 mb-2 heading">Recording Status</h3>
        <ul className="space-y-3">
          {processingRecordings.map((recording) => (
            <li key={recording._id} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 truncate ui-text">
                  Recording from {new Date(recording._creationTime).toLocaleString()}
                </span>
                {recording.status === "processing" && (
                  <div className="flex items-center space-x-2 text-blue-500">
                    <Spinner size="sm" className="text-blue-500" />
                    <span>Processing...</span>
                  </div>
                )}
                {recording.status === "failed" && (
                  <div className="flex items-center space-x-2 text-red-500">
                    <XCircle className="w-4 h-4" />
                    <span>Failed</span>
                  </div>
                )}
              </div>
              {recording.status === "failed" && recording.errorMessage && (
                <p className="text-xs text-red-600 mt-1 ml-1 bg-red-50 p-2 rounded-md">
                  {recording.errorMessage}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
