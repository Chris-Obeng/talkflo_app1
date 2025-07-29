"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

// Initialize OpenAI client with user's key, falling back to the bundled key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.CONVEX_OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_KEY ? undefined : process.env.CONVEX_OPENAI_BASE_URL,
});

export const processRecording = internalAction({
  args: { recordingId: v.id("recordings") },
  handler: async (ctx, args) => {
    const recording = await ctx.runQuery(internal.storage.getRecording, {
      recordingId: args.recordingId,
    });

    if (!recording) {
      throw new Error("Recording not found");
    }

    try {
      const audioUrl = await ctx.storage.getUrl(recording.audioData);
      if (!audioUrl) throw new Error("Audio file not found");

      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const token = process.env.OPENAI_API_KEY || process.env.CONVEX_OPENAI_API_KEY;
      const baseUrl = (process.env.OPENAI_API_KEY 
        ? 'https://api.openai.com/v1' 
        : (process.env.CONVEX_OPENAI_BASE_URL || 'https://api.openai.com/v1')).replace(/\/$/, '');

      const transcriptionFetchResponse = await fetch(`${baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!transcriptionFetchResponse.ok) {
        const errorBody = await transcriptionFetchResponse.json();
        throw new Error(`OpenAI Transcription Error: ${transcriptionFetchResponse.status} ${JSON.stringify(errorBody)}`);
      }

      const { text: transcript } = await transcriptionFetchResponse.json();

      const processedResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert text editor..." },
          { role: "user", content: transcript },
        ],
        temperature: 0.3,
      });
      const processedText = processedResponse.choices[0].message.content || transcript;

      await ctx.runMutation(internal.storage.updateRecording, {
        recordingId: args.recordingId,
        transcript,
        processedText,
        status: "completed",
      });

      if (recording.noteIdToAppend) {
        await ctx.runMutation(internal.notes.appendContent, {
          noteId: recording.noteIdToAppend,
          newContent: processedText,
          newTranscript: transcript,
        });
        await ctx.runMutation(internal.notes.deleteAudio, {
          noteId: recording.noteIdToAppend,
          storageId: recording.audioData,
        });
      } else {
        const titleResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Generate a concise, descriptive title (max 60 characters)..." },
            { role: "user", content: processedText },
          ],
          temperature: 0.3,
        });
        const title = titleResponse.choices[0].message.content || "Untitled Note";

        const noteId = await ctx.runMutation(internal.notes.internalCreate, {
          userId: recording.userId,
          title: title.substring(0, 60),
          content: processedText,
          transcript,
          audioUrl: recording.audioData,
          duration: recording.duration,
          folderId: recording.folderId,
        });
        
        await ctx.runMutation(internal.notes.deleteAudio, {
          noteId: noteId,
          storageId: recording.audioData,
        });
      }
    } catch (error: any) {
      console.error("Error processing recording:", error);
      let errorMessage = "An unknown error occurred.";
      if (error instanceof OpenAI.APIError) {
        errorMessage = `OpenAI Error: ${error.status} ${error.name} - ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      await ctx.runMutation(internal.storage.updateRecording, {
        recordingId: args.recordingId,
        status: "failed",
        errorMessage,
      });
      throw error;
    }
  },
});
