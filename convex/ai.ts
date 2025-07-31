import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import OpenAI from "openai";
import { stylePrompts, defaultPrompt, baseSystemPrompt } from "./prompts";

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
      const [note, settings] = await Promise.all([
        ctx.runQuery(internal.notes.internalGet, { id: args.noteId }),
        ctx.runQuery(api.settings.get),
      ]);

      if (!note) {
        throw new Error("Note not found");
      }

      const transcript = note.transcript || note.content;
      if (!transcript) {
        throw new Error("Note has no transcript or content to generate from.");
      }

      const promptDetails = stylePrompts[args.style] || defaultPrompt;
      const systemContent = promptDetails.system;
      const userContent = promptDetails.user(
        transcript,
        args.style.replace(/"/g, ''),
        settings?.outputLanguage,
        settings?.writingStyle
      );

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

export const rewriteContent = action({
  args: {
    noteId: v.id("notes"),
    instructions: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.notes.internalSetStatus, { id: args.noteId, status: "generating" });

    try {
      const [note, settings] = await Promise.all([
        ctx.runQuery(internal.notes.internalGet, { id: args.noteId }),
        ctx.runQuery(api.settings.get),
      ]);

      if (!note) {
        throw new Error("Note not found");
      }

      const transcript = note.transcript;
      if (!transcript) {
        throw new Error("Note has no original transcript to rewrite from.");
      }

      const systemContent = baseSystemPrompt;
      let userContent = `Rewrite the following transcript based on these instructions: ${args.instructions.replace(/"/g, '')}\n`;
      if (settings?.outputLanguage) {
        userContent += `The output language must be ${settings.outputLanguage}.\n`;
      }
      if (settings?.writingStyle) {
        userContent += `The writing style should be: ${settings.writingStyle}.\n`;
      }
      userContent += `\n---\n\n${transcript}`;

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
      
      console.error("Failed to rewrite content with OpenAI:", error);
      let errorMessage = "AI content rewrite failed.";
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
