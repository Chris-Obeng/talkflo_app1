import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { stylePrompts, defaultPrompt } from "./prompts";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generateContent = action({
  args: {
    noteId: v.id("notes"),
    style: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.notes.internalSetStatus, { id: args.noteId, status: "generating" });

    try {
      const note = await ctx.runQuery(internal.notes.internalGet, { id: args.noteId });
      if (!note) {
        throw new Error("Note not found");
      }

      const transcript = note.transcript || note.content;
      if (!transcript) {
        throw new Error("Note has no transcript or content to generate from.");
      }

      const promptDetails = stylePrompts[args.style] || defaultPrompt;
      const systemContent = promptDetails.system;
      const userContent = promptDetails.user(transcript, args.style);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ],
      });

      const newContent = response.choices[0].message.content;

      if (!newContent) {
        throw new Error("OpenAI returned empty content.");
      }

      await ctx.runMutation(internal.ai.updateNoteContent, {
        noteId: args.noteId,
        newContent: newContent,
      });

    } catch (error) {
      await ctx.runMutation(internal.notes.internalSetStatus, { id: args.noteId, status: "completed" });
      
      console.error("Failed to generate content with OpenAI:", error);
      let errorMessage = "AI content generation failed.";
      if (error instanceof OpenAI.APIError) {
        errorMessage = `OpenAI Error: ${error.status} ${error.name} - ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  },
});

export const updateNoteContent = internalMutation({
    args: {
        noteId: v.id("notes"),
        newContent: v.string(),
    },
    handler: async (ctx, { noteId, newContent }) => {
        await ctx.db.patch(noteId, { content: newContent, status: "completed" });
    },
});
