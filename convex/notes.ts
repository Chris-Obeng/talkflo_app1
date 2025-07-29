import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz1234567890", 10);

export const list = query({
  args: {
    folderId: v.optional(v.id("folders")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.search) {
      return await ctx.db.query("notes").withSearchIndex("search_content", (q) => q.search("content", args.search!).eq("userId", userId)).collect();
    }

    let notesQuery = args.folderId
      ? ctx.db.query("notes").withIndex("by_user_and_folder", (q) => q.eq("userId", userId).eq("folderId", args.folderId!))
      : ctx.db.query("notes").withIndex("by_user", (q) => q.eq("userId", userId));

    return await notesQuery.order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) throw new Error("Note not found");
    return note;
  },
});

export const getPublished = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const note = await ctx.db.query("notes").withIndex("by_publish_token", q => q.eq("publishToken", args.token)).unique();
    if (!note || !note.published) {
      return null;
    }
    return {
      title: note.title,
      content: note.content,
      _creationTime: note._creationTime,
    };
  },
});

export const internalGet = internalQuery({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    folderId: v.optional(v.id("folders")),
    transcript: v.optional(v.string()),
    audioUrl: v.optional(v.id("_storage")),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("notes", { userId, ...args, status: "completed" });
  },
});

export const internalCreate = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    folderId: v.optional(v.id("folders")),
    transcript: v.optional(v.string()),
    audioUrl: v.optional(v.id("_storage")),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notes", { ...args, status: "completed" });
  },
});

export const appendContent = internalMutation({
  args: {
    noteId: v.id("notes"),
    newContent: v.string(),
    newTranscript: v.string(),
  },
  handler: async (ctx, { noteId, newContent, newTranscript }) => {
    const note = await ctx.db.get(noteId);
    if (!note) throw new Error("Note not found to append to");
    await ctx.db.patch(noteId, {
      content: `${note.content}\n\n${newContent}`,
      transcript: `${note.transcript || ''}\n\n${newTranscript}`,
    });
  },
});

export const deleteAudio = internalMutation({
  args: { noteId: v.id("notes"), storageId: v.id("_storage") },
  handler: async (ctx, { noteId, storageId }) => {
    await ctx.storage.delete(storageId);
    await ctx.db.patch(noteId, { audioUrl: undefined, duration: undefined });
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) throw new Error("Note not found");
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("notes"),
    status: v.union(v.literal("recording"), v.literal("transcribing"), v.literal("processing"), v.literal("completed"), v.literal("generating")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) throw new Error("Note not found");
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const internalSetStatus = internalMutation({
  args: {
    id: v.id("notes"),
    status: v.union(v.literal("recording"), v.literal("transcribing"), v.literal("processing"), v.literal("completed"), v.literal("generating")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updatePublishStatus = mutation({
  args: {
    id: v.id("notes"),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) throw new Error("Note not found");
    
    let token = note.publishToken;
    if (args.published && !token) {
      token = nanoid();
    }
    
    await ctx.db.patch(args.id, { published: args.published, publishToken: token });
    return token;
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) throw new Error("Note not found");
    await ctx.db.delete(args.id);
  },
});

export const removeBatch = mutation({
  args: { ids: v.array(v.id("notes")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    for (const id of args.ids) {
      const note = await ctx.db.get(id);
      if (note && note.userId === userId) {
        await ctx.db.delete(id);
      }
    }
  },
});
