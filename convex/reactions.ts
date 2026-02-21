import { mutation } from "./_generated/server";
import { v } from "convex/values";

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

// Toggle reaction (add if not exists, remove if exists)
export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        if (!ALLOWED_EMOJIS.includes(args.emoji)) {
            throw new Error("Invalid emoji");
        }

        const existing = await ctx.db
            .query("reactions")
            .withIndex("by_messageId_userId_emoji", (q) =>
                q
                    .eq("messageId", args.messageId)
                    .eq("userId", args.userId)
                    .eq("emoji", args.emoji)
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        } else {
            await ctx.db.insert("reactions", {
                messageId: args.messageId,
                userId: args.userId,
                emoji: args.emoji,
            });
        }
    },
});
