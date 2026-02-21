import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Set user online/offline
export const setPresence = mutation({
    args: {
        userId: v.id("users"),
        isOnline: v.boolean(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("presence")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                isOnline: args.isOnline,
                lastSeen: Date.now(),
            });
        } else {
            await ctx.db.insert("presence", {
                userId: args.userId,
                isOnline: args.isOnline,
                lastSeen: Date.now(),
            });
        }
    },
});

// Get presence for a list of users
export const getPresence = query({
    args: { userIds: v.array(v.id("users")) },
    handler: async (ctx, args) => {
        const presenceList = await Promise.all(
            args.userIds.map(async (userId) => {
                const presence = await ctx.db
                    .query("presence")
                    .withIndex("by_userId", (q) => q.eq("userId", userId))
                    .unique();
                return { userId, isOnline: presence?.isOnline ?? false, lastSeen: presence?.lastSeen };
            })
        );
        return presenceList;
    },
});
