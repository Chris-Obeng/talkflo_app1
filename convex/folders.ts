import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("folders", {
      userId,
      name: args.name,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("folders"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found");
    }

    await ctx.db.patch(args.id, { name: args.name });
  },
});

export const remove = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found");
    }

    // You might want to decide what to do with notes in the deleted folder.
    // For now, we'll just delete the folder.
    await ctx.db.delete(args.id);
  },
});
