import { Id } from "../_generated/dataModel";
import { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";

export interface MessageContext {
  senderName: string;
  content: string;
  createdAt: number;
}

// Fetches recent conversation messages and returns them as a lightweight
 
export async function retrieveRelevantMessages(
  ctx: ActionCtx,
  conversationId: Id<"conversations">
): Promise<MessageContext[]> {
  const messages = await ctx.runQuery(internal.messages.getRecentForAI, {
    conversationId,
  });
  return messages as MessageContext[];
}
