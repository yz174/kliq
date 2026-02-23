import { Id } from "../_generated/dataModel";
import { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";

export interface MessageContext {
  senderName: string;
  content: string;
  createdAt: number;
}

/**
 * Fetches recent conversation messages and returns them as a lightweight
 * context array for LLM prompt injection.
 *
 * Phase 1: Returns the 40 most recent non-deleted, non-system messages.
 * Phase 2 upgrade: Replace with vectorSearch for semantic retrieval once
 * all message embeddings are populated.
 */
export async function retrieveRelevantMessages(
  ctx: ActionCtx,
  conversationId: Id<"conversations">
): Promise<MessageContext[]> {
  const messages = await ctx.runQuery(internal.messages.getRecentForAI, {
    conversationId,
  });
  return messages as MessageContext[];
}
