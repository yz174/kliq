import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { createEmbedding } from "../services/llm";

// Patch a message record with its generated embedding vector.
 
export const patchEmbedding = internalMutation({
  args: {
    messageId: v.id("messages"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { embedding: args.embedding });
  },
});

// Async job: generate a 768-dim embedding for a message and store it.
 
export const generate = internalAction({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.runQuery(internal.messages.getMessageById, {
      messageId: args.messageId,
    });

    if (!message || message.isDeleted || !message.content?.trim()) return;

    try {
      const embedding = await createEmbedding(message.content);
      await ctx.runMutation(internal.ai.embeddings.patchEmbedding, {
        messageId: args.messageId,
        embedding,
      });
    } catch (err) {
      // Embedding failures are non-fatal — message was already saved
      console.error("[embeddings.generate] Failed:", err);
    }
  },
});
