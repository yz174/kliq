"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";

interface TypingIndicatorProps {
    names: string[];
    imageUrls?: (string | null | undefined)[];
}

export function TypingIndicator({ names, imageUrls = [] }: TypingIndicatorProps) {
    if (names.length === 0) return null;

    const label =
        names.length === 1
            ? `${names[0]} is typing...`
            : names.length === 2
                ? `${names[0]} and ${names[1]} are typing...`
                : "Several people are typing...";

    return (
        <div className="flex items-end gap-2.5 px-4 py-2">
            {/* Avatar of first typer */}
            <UserAvatar
                src={imageUrls[0]}
                name={names[0] ?? "?"}
                size="sm"
            />
            <div className="flex flex-col items-start gap-1">
                {/* Animated dots bubble */}
                <div className="flex items-center gap-1.5 bg-[var(--message-received)] rounded-2xl rounded-bl-sm px-4 py-3">
                    <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/70" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/70" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/70" />
                </div>
                <span className="text-[11px] text-muted-foreground px-1">{label}</span>
            </div>
        </div>
    );
}
