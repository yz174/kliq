import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upsert user on Clerk sign-in
export const upsertUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl,
            });
            return existing._id;
        }

        const userId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl,
            createdAt: Date.now(),
        });

        // Initialize presence as offline
        await ctx.db.insert("presence", {
            userId,
            isOnline: false,
            lastSeen: Date.now(),
        });

        return userId;
    },
});

// Get current user by clerkId
export const getMe = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});

// Get all users except current user
export const getUsers = query({
    args: { currentClerkId: v.string() },
    handler: async (ctx, args) => {
        const allUsers = await ctx.db.query("users").collect();
        return allUsers.filter((u) => u.clerkId !== args.currentClerkId);
    },
});

// Get user by ID
export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

// Get multiple users by IDs
export const getUsersByIds = query({
    args: { userIds: v.array(v.id("users")) },
    handler: async (ctx, args) => {
        const users = await Promise.all(args.userIds.map((id) => ctx.db.get(id)));
        return users.filter(Boolean);
    },
});
