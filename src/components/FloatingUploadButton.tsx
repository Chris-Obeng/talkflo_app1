import { useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

interface FloatingUploadButtonProps {
  folderId?: Id<"folders">;
}

export function FloatingUploadButton({ folderId }: FloatingUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const createRecording = useMutation(api.storage.createRecording);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input for same-file uploads
    event.target.value = "";

    toast.info("Uploading your file...");

    try {
      const uploadUrl = await generateUploadUrl();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(`Failed to upload audio: ${JSON.stringify(error)}`);
      }

      const { storageId } = await uploadResponse.json();

      // Get audio duration
      const audio = document.createElement('audio');
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = async () => {
        const duration = audio.duration;
        URL.revokeObjectURL(audio.src); // Clean up

        await createRecording({ audioData: storageId, duration, folderId });
        toast.success("Upload complete! Processing your audio...");
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        toast.error("Could not read audio file metadata.");
      };

    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="audio/*"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center justify-center font-medium text-orange-600 transition-all"
        title="Upload Audio"
      >
        <Upload className="w-5 h-5" />
      </button>
    </>
  );
}
