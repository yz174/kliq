import { Id } from "../_generated/dataModel";
import { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";

export interface MessageContext {
  senderId: string;
  senderName: string;
  content: string;
  createdAt: number;
}

/**
 * Fetches recent conversation messages as LLM context.
 *
 * @param requestingUserId — when provided, only messages NOT sent by this user
 *   are returned (used for /reply so suggestions are based on the other person's messages).
 */
export async function retrieveRelevantMessages(
  ctx: ActionCtx,
  conversationId: Id<"conversations">,
  requestingUserId?: string
): Promise<MessageContext[]> {
  const messages = await ctx.runQuery(internal.messages.getRecentForAI, {
    conversationId,
  });
  const all = messages as MessageContext[];

  // For /reply: return only messages from other participants so the AI
  // bases suggestions on what the other person said, not the requester's own words.
  if (requestingUserId) {
    return all.filter((m) => m.senderId !== requestingUserId);
  }
  return all;
}
