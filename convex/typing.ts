import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const TYPING_TIMEOUT_MS = 3000;

// Set or clear typing status
export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("typing")
            .withIndex("by_conversationId_userId", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", args.userId)
            )
            .unique();

        if (args.isTyping) {
            if (existing) {
                await ctx.db.patch(existing._id, { lastTypedAt: Date.now() });
            } else {
                await ctx.db.insert("typing", {
                    conversationId: args.conversationId,
                    userId: args.userId,
                    lastTypedAt: Date.now(),
                });
            }
        } else {
            if (existing) {
                await ctx.db.delete(existing._id);
            }
        }
    },
});

// Get who is currently typing in a conversation (excluding self)
export const getTypingUsers = query({
    args: {
        conversationId: v.id("conversations"),
        currentUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const typingRecords = await ctx.db
            .query("typing")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const cutoff = Date.now() - TYPING_TIMEOUT_MS;

        const activeTypers = typingRecords.filter(
            (r) =>
                r.userId !== args.currentUserId && r.lastTypedAt > cutoff
        );

        const users = await Promise.all(
            activeTypers.map((r) => ctx.db.get(r.userId))
        );

        return users.filter(Boolean);
    },
});
