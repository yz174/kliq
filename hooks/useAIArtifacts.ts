"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface AIArtifact {
  _id: Id<"aiArtifacts">;
  conversationId: Id<"conversations">;
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

export interface AIArtifactsState {
  summary: AIArtifact | null;
  actionItems: AIArtifact | null;
  smartReplies: string[];
  isLoading: boolean;
}

//Returns the latest artifact of each type, parsed and ready to render.
 
export function useAIArtifacts(
  conversationId: Id<"conversations">
): AIArtifactsState {
  const artifacts = useQuery(api.ai.artifacts.getArtifacts, {
    conversationId,
  });

  if (artifacts === undefined) {
    return { summary: null, actionItems: null, smartReplies: [], isLoading: true };
  }

  const byType = (type: string): AIArtifact | null =>
    (artifacts as AIArtifact[]).find((a) => a.type === type) ?? null;

  const replyArtifact = byType("reply");
  const smartReplies: string[] = replyArtifact
    ? replyArtifact.content
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  return {
    summary: byType("summary"),
    actionItems: byType("actions"),
    smartReplies,
    isLoading: false,
  };
}
