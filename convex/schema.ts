import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(), // clerkId
    email: v.string(),
    name: v.string(),
    isPro: v.boolean(),
    proSince: v.optional(v.number()),
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueezyOrderId: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  snippets: defineTable({
    userId: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    userName: v.string(), // store user's name for easy access
  }).index("by_user_id", ["userId"]),

  snippetComments: defineTable({
    snippetId: v.id("snippets"),
    userId: v.string(),
    userName: v.string(),
    content: v.string(), // This will store HTML content
  }).index("by_snippet_id", ["snippetId"]),

  stars: defineTable({
    userId: v.string(),
    snippetId: v.id("snippets"),
  })
    .index("by_user_id", ["userId"])
    .index("by_snippet_id", ["snippetId"])
    .index("by_user_id_and_snippet_id", ["userId", "snippetId"]),

  // Collaboration tables
  rooms: defineTable({
    roomId: v.string(),
    code: v.string(),
    language: v.string(),
    createdAt: v.number(),
    lastUpdated: v.number(),
  }).index("by_room_id", ["roomId"]),

  roomUsers: defineTable({
    roomId: v.string(),
    userId: v.string(),
    username: v.string(),
    color: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_room", ["roomId"]),

  roomEvents: defineTable({
    roomId: v.string(),
    userId: v.string(),
    type: v.string(), // 'code_change', 'cursor_move', 'language_change'
    data: v.any(),
    timestamp: v.number(),
  }).index("by_room", ["roomId"]),
});