import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Public query — subscribe to AI artifacts for a specific user in a conversation.
 * Returns the latest artifact per type. Scoped to userId so each user only
 * sees artifacts they triggered themselves.
 */
export const getArtifacts = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const artifacts = await ctx.db
      .query("aiArtifacts")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
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
 * Returns the most recent artifact of a given type for a specific user.
 */
export const getLatestByType = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiArtifacts")
      .withIndex("by_conversation_user_type", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", args.userId)
          .eq("type", args.type)
      )
      .order("desc")
      .first();
  },
});
