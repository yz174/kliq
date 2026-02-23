import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { detectAICommand } from "./ai/commands";
import { internal } from "./_generated/api";

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

        // ── AI hooks (async, zero latency impact) ──────────────────────────
        // 1. Generate embedding for this message (powers semantic search)
        await ctx.scheduler.runAfter(0, internal.ai.embeddings.generate, {
            messageId,
        });

        // 2. If user typed an AI command, run the corresponding AI worker
        const command = detectAICommand(args.content);
        if (command) {
            await ctx.scheduler.runAfter(0, internal.ai.workers.runCommand, {
                conversationId: args.conversationId,
                command,
            });
        }

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

// ── Internal queries used by AI workers ────────────────────────────────────

/** Fetch a single message by ID — used by the embedding pipeline. */
export const getMessageById = internalQuery({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.messageId);
    },
});

/**
 * Fetch recent messages with sender names for AI context.
 * Returns up to 40 messages, excluding deleted and system messages.
 */
export const getRecentForAI = internalQuery({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId_createdAt", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("desc")
            .take(40);

        const enriched = await Promise.all(
            messages
                .filter((m) => !m.isDeleted && m.type !== "system")
                .map(async (m) => {
                    const sender = await ctx.db.get(m.senderId);
                    return {
                        content: m.content,
                        senderName: sender?.name ?? "Unknown",
                        createdAt: m.createdAt,
                    };
                })
        );

        // Return in chronological order
        return enriched.reverse();
    },
});
