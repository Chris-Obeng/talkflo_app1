import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const createRecording = mutation({
  args: {
    audioData: v.id("_storage"),
    duration: v.number(),
    folderId: v.optional(v.id("folders")),
    noteIdToAppend: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const recordingId = await ctx.db.insert("recordings", {
      userId,
      audioData: args.audioData,
      duration: args.duration,
      status: "processing",
      folderId: args.folderId,
      noteIdToAppend: args.noteIdToAppend,
    });

    // Schedule transcription
    await ctx.scheduler.runAfter(0, internal.recordings.processRecording, {
      recordingId,
    });

    return recordingId;
  },
});

export const getRecentRecordings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("recordings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);
  },
});

export const getRecordingStatus = query({
  args: { recordingId: v.id("recordings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const recording = await ctx.db.get(args.recordingId);
    if (!recording || recording.userId !== userId) {
      return null;
    }

    return {
      status: recording.status,
      transcript: recording.transcript,
      processedText: recording.processedText,
    };
  },
});

export const getRecording = internalQuery({
  args: { recordingId: v.id("recordings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.recordingId);
  },
});

export const updateRecording = internalMutation({
  args: {
    recordingId: v.id("recordings"),
    transcript: v.optional(v.string()),
    processedText: v.optional(v.string()),
    status: v.union(v.literal("uploading"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { recordingId, ...updates } = args;
    await ctx.db.patch(recordingId, updates);
  },
});
