"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { AIArtifact } from "@/hooks/useAIArtifacts";

interface AISummaryCardProps {
  artifact?: AIArtifact | null;
  loading?: boolean;
}

export function AISummaryCard({ artifact, loading }: AISummaryCardProps) {
  const [expanded, setExpanded] = useState(true);

  const timeAgo = artifact ? formatTimeAgo(artifact.createdAt) : "";

  return (
    <div className="mx-4 mb-2 rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-400" />
        <span className="flex-1 text-xs font-medium text-violet-300">
          AI Summary
        </span>
        {loading && !artifact ? (
          <span className="h-2 w-12 rounded bg-white/10 animate-pulse inline-block" />
        ) : (
          <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
        )}
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-3 pb-3 pt-0">
          {loading && !artifact ? (
            <div className="space-y-2">
              <div className="h-2.5 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-2.5 w-[92%] rounded bg-white/10 animate-pulse" />
              <div className="h-2.5 w-4/5 rounded bg-white/10 animate-pulse" />
              <div className="h-2.5 w-3/4 rounded bg-white/10 animate-pulse" />
              <div className="h-2.5 w-2/3 rounded bg-white/10 animate-pulse" />
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {artifact?.content}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
