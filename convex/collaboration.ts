import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

export const joinRoom = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, { roomId, userId, username }) => {
    // Create room if doesn't exist
    const existingRoom = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("roomId", roomId))
      .first();

    if (!existingRoom) {
      await ctx.db.insert("rooms", {
        roomId,
        code: "",
        language: "javascript",
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      });
    }

    // Get all users in room
    const allRoomUsers = await ctx.db
      .query("roomUsers")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();

    // Find if this user already exists
    const existingUser = allRoomUsers.find(u => u.userId === userId);

    // Assign color
    const color = USER_COLORS[allRoomUsers.length % USER_COLORS.length];

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        isOnline: true,
        lastSeen: Date.now(),
        username,
      });
    } else {
      // Create new user
      await ctx.db.insert("roomUsers", {
        roomId,
        userId,
        username,
        color,
        isOnline: true,
        lastSeen: Date.now(),
      });
    }

    return { success: true, color };
  },
});

export const leaveRoom = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { roomId, userId }) => {
    const allUsers = await ctx.db
      .query("roomUsers")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    
    const user = allUsers.find(u => u.userId === userId);

    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: false,
        lastSeen: Date.now(),
      });
    }
  },
});

export const updateCode = mutation({
  args: {
    roomId: v.string(),
    code: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { roomId, code, userId }) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("roomId", roomId))
      .first();

    if (room) {
      await ctx.db.patch(room._id, {
        code,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const updateLanguage = mutation({
  args: {
    roomId: v.string(),
    language: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { roomId, language, userId }) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("roomId", roomId))
      .first();

    if (room) {
      await ctx.db.patch(room._id, {
        language,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const getRoomState = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("roomId", roomId))
      .first();

    if (!room) return null;

    return {
      code: room.code,
      language: room.language,
      lastUpdated: room.lastUpdated,
    };
  },
});

export const getRoomUsers = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    return await ctx.db
      .query("roomUsers")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .filter((q) => q.eq(q.field("isOnline"), true))
      .collect();
  },
});

export const getRecentEvents = query({
  args: { 
    roomId: v.string(),
    since: v.number(),
  },
  handler: async (ctx) => {
    return [];
  },
});