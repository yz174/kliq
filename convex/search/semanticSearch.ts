import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { createEmbedding } from "../services/llm";
import { Id } from "../_generated/dataModel";

type MessageWithScore = {
  _id: Id<"messages">;
  conversationId: Id<"conversations">;
  senderId: Id<"users">;
  content: string;
  isDeleted: boolean;
  createdAt: number;
  embedding?: number[];
  score: number;
};

// Semantic search over messages in a conversation.
 
export const semanticSearch = action({
  args: {
    conversationId: v.id("conversations"),
    query: v.string(),
  },
  handler: async (ctx, args): Promise<MessageWithScore[]> => {
    // 1. Embed the search query using the same model as the messages
    const queryEmbedding = await createEmbedding(args.query);

    // 2. Vector search — returns up to 10 similar messages scoped to this conversation
    const results = await ctx.vectorSearch("messages", "by_embedding", {
      vector: queryEmbedding,
      limit: 10,
      filter: (q) => q.eq("conversationId", args.conversationId),
    });

    // 3. Fetch full message documents for the matched IDs
    const messages = await Promise.all(
      results.map(async (result): Promise<MessageWithScore | null> => {
        const message = await ctx.runQuery(internal.messages.getMessageById, {
          messageId: result._id,
        });
        if (!message) return null;
        return { ...message, score: result._score };
      })
    );

    return (messages as Array<MessageWithScore | null>)
      .filter((m): m is MessageWithScore => m !== null && !m.isDeleted)
      .sort((a, b) => b.score - a.score);
  },
});
