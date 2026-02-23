import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Public query — subscribe to all AI artifacts for a conversation.
 * Returns the latest artifact per type as a map.
 */
export const getArtifacts = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const artifacts = await ctx.db
      .query("aiArtifacts")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .collect();

    // Deduplicate — keep only the latest artifact per type
    const seen = new Set<string>();
    const latest: typeof artifacts = [];
    for (const a of artifacts) {
      if (!seen.has(a.type)) {
        seen.add(a.type);
        latest.push(a);
      }
    }
    return latest;
  },
});

/**
 * Internal query used by workers for cooldown deduplication.
 * Returns the most recent artifact of a given type for a conversation.
 */
export const getLatestByType = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiArtifacts")
      .withIndex("by_conversation_type", (q) =>
        q.eq("conversationId", args.conversationId).eq("type", args.type)
      )
      .order("desc")
      .first();
  },
});
