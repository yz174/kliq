"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartRepliesProps {
  replies: string[];
  loading?: boolean;
  onSelect: (reply: string) => void;
}

export function SmartReplies({ replies, loading, onSelect }: SmartRepliesProps) {
  if (!loading && replies.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto scrollbar-none">
      <Zap className="h-3 w-3 shrink-0 text-sky-400" />
      {loading ? (
        <>
          {[80, 112, 96].map((w, i) => (
            <div
              key={i}
              className="h-6 shrink-0 rounded-full bg-white/10 animate-pulse"
              style={{ width: `${w}px` }}
            />
          ))}
        </>
      ) : (
        replies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(reply)}
            className={cn(
              "shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1",
              "text-xs text-foreground/80 whitespace-nowrap",
              "transition-colors hover:bg-white/[0.08] hover:border-white/20 hover:text-foreground",
              "focus:outline-none focus:ring-1 focus:ring-sky-400/50"
            )}
          >
            {reply}
          </button>
        ))
      )}
    </div>
  );
}
