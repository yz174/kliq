"use client";

import { useState } from "react";
import { CheckSquare, Square, ChevronDown, ChevronUp, ListTodo, X } from "lucide-react";
import type { AIArtifact } from "@/hooks/useAIArtifacts";

interface ActionItemsPanelProps {
  artifact?: AIArtifact | null;
  loading?: boolean;
  onDismiss?: () => void;
}

export function ActionItemsPanel({ artifact, loading, onDismiss }: ActionItemsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  // Parse numbered list from AI output
  // - Strip leading number+dot ("1. ", "2. ", etc.)
  // - Drop blank lines and header-only lines that end with ":" (LLM echo artifacts)
  const items = artifact
    ? artifact.content
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter((line) => line.length > 0 && !line.endsWith(":"))
    : [];

  const toggle = (idx: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });

  if (!loading && (items.length === 0 || (artifact && artifact.content.toLowerCase().includes("no action items")))) {
    return null;
  }

  return (
    <div className="mx-4 mb-2 rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
      {/* Header */}
      <div className="flex w-full items-center gap-2 px-3 py-2.5">
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80"
        >
          <ListTodo className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          <span className="flex-1 text-xs font-medium text-amber-300">
            Action Items
            {artifact && (
              <span className="ml-1.5 text-[10px] text-muted-foreground">
                ({items.length - checked.size} remaining)
              </span>
            )}
          </span>
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
            aria-label="Dismiss action items"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Items */}
      {expanded && (
        <ul className="px-3 pb-3 pt-0 space-y-1.5">
          {loading ? (
            [72, 90, 60].map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="h-3.5 w-3.5 mt-0.5 shrink-0 rounded bg-white/10 animate-pulse" />
                <div className="h-2.5 rounded bg-white/10 animate-pulse" style={{ width: `${w}%` }} />
              </li>
            ))
          ) : (
            items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <button
                  onClick={() => toggle(idx)}
                  className="mt-0.5 shrink-0 transition-opacity hover:opacity-80"
                >
                  {checked.has(idx) ? (
                    <CheckSquare className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Square className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                <span
                  className={
                    checked.has(idx)
                      ? "text-xs text-muted-foreground line-through"
                      : "text-xs text-foreground/80"
                  }
                >
                  {item}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
