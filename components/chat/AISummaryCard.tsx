"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import type { AIArtifact } from "@/hooks/useAIArtifacts";

interface AISummaryCardProps {
  artifact?: AIArtifact | null;
  loading?: boolean;
  onDismiss?: () => void;
}

export function AISummaryCard({ artifact, loading, onDismiss }: AISummaryCardProps) {
  const [expanded, setExpanded] = useState(true);

  const timeAgo = artifact ? formatTimeAgo(artifact.createdAt) : "";

  return (
    <div className="mx-4 mb-2 rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
      {/* Header */}
      <div className="flex w-full items-center gap-2 px-3 py-2.5">
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80"
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
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-1 shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-white/[0.06]"
            aria-label="Dismiss summary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

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
