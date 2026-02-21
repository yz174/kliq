import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Send a new message
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: args.senderId,
            content: args.content,
            isDeleted: false,
            createdAt: now,
        });

        // Update lastMessageId and lastMessageTime on the conversation
        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
            lastMessageTime: now,
        });

        return messageId;
    },
});

// Get all messages for a conversation (real-time subscription)
export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId_createdAt", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("asc")
            .collect();

        // Enrich with sender info and reactions
        const enriched = await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);
                const reactions = await ctx.db
                    .query("reactions")
                    .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
                    .collect();

                // Group reactions by emoji
                const reactionGroups: Record<string, { emoji: string; count: number; userIds: string[] }> = {};
                for (const reaction of reactions) {
                    if (!reactionGroups[reaction.emoji]) {
                        reactionGroups[reaction.emoji] = { emoji: reaction.emoji, count: 0, userIds: [] };
                    }
                    reactionGroups[reaction.emoji].count++;
                    reactionGroups[reaction.emoji].userIds.push(reaction.userId);
                }

                return {
                    ...msg,
                    sender,
                    reactions: Object.values(reactionGroups),
                };
            })
        );

        return enriched;
    },
});

// Soft delete a message
export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");
        if (message.senderId !== args.userId) throw new Error("Unauthorized");

        await ctx.db.patch(args.messageId, { isDeleted: true });
    },
});
