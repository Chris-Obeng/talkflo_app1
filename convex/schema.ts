import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  notes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    transcript: v.optional(v.string()),
    audioUrl: v.optional(v.id("_storage")),
    folderId: v.optional(v.id("folders")),
    duration: v.optional(v.number()),
    status: v.union(v.literal("recording"), v.literal("transcribing"), v.literal("processing"), v.literal("completed"), v.literal("generating")),
    tags: v.optional(v.array(v.string())),
    published: v.optional(v.boolean()),
    publishToken: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_folder", ["userId", "folderId"])
    .index("by_publish_token", ["publishToken"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId", "folderId", "tags"],
    }),

  recordings: defineTable({
    userId: v.id("users"),
    audioData: v.id("_storage"),
    duration: v.number(),
    status: v.union(v.literal("uploading"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    transcript: v.optional(v.string()),
    processedText: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    noteIdToAppend: v.optional(v.id("notes")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  folders: defineTable({
    userId: v.id("users"),
    name: v.string(),
  })
    .index("by_user", ["userId"]),
  
  userSettings: defineTable({
    userId: v.id("users"),
    inputLanguage: v.optional(v.string()),
    outputLanguage: v.optional(v.string()),
    writingStyle: v.optional(v.string()),
    writingLength: v.optional(v.union(v.literal("short"), v.literal("medium"), v.literal("long"))),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
