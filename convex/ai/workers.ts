import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { AICommand } from "./commands";
import { buildPrompt } from "./prompts";
import { retrieveRelevantMessages } from "./retrieval";
import { callGemini } from "../services/llm";

/** 15-minute cooldown in milliseconds */
const COOLDOWN_MS = 15 * 60 * 1000;

// Insert an AI artifact into the database
 
export const insertArtifact = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    type: v.string(),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiArtifacts", {
      conversationId: args.conversationId,
      type: args.type,
      content: args.content,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

/**
 * Main AI worker. Runs asynchronously after a /command is detected in sendMessage.
 */
export const runCommand = internalAction({
  args: {
    conversationId: v.id("conversations"),
    command: v.string(),
  },
  handler: async (ctx, args) => {
    const { conversationId, command } = args;

    // ── Cooldown check ──────────────────────────────────────────────────────
    const existing = await ctx.runQuery(internal.ai.artifacts.getLatestByType, {
      conversationId,
      type: command,
    });
    if (existing && Date.now() - existing.createdAt < COOLDOWN_MS) {
      console.log(
        `[workers.runCommand] Cooldown active for "${command}" in ${conversationId}`
      );
      return;
    }

    // ── Retrieve context ────────────────────────────────────────────────────
    const context = await retrieveRelevantMessages(ctx, conversationId);
    if (context.length === 0) return;

    // ── Build prompt + call LLM ─────────────────────────────────────────────
    const prompt = buildPrompt(command as AICommand, context);
    let result: string;
    try {
      result = await callGemini(prompt);
    } catch (err) {
      console.error("[workers.runCommand] Gemini call failed:", err);
      return;
    }

    // ── Store artifact ──────────────────────────────────────────────────────
    await ctx.runMutation(internal.ai.workers.insertArtifact, {
      conversationId,
      type: command,
      content: result.trim(),
      metadata: { messageCount: context.length },
    });
  },
});
