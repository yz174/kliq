"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { formatMessageTime } from "@/lib/formatDate";
import { REACTION_EMOJIS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Reaction {
    emoji: string;
    count: number;
    userIds: string[];
}

interface MessageBubbleProps {
    messageId: Id<"messages">;
    content: string;
    senderId: Id<"users">;
    senderName: string;
    senderImage?: string | null;
    createdAt: number;
    isOwnMessage: boolean;
    isDeleted: boolean;
    reactions: Reaction[];
    currentUserId: Id<"users">;
    showAvatar?: boolean;
}

export function MessageBubble({
    messageId,
    content,
    senderId,
    senderName,
    senderImage,
    createdAt,
    isOwnMessage,
    isDeleted,
    reactions,
    currentUserId,
    showAvatar = true,
}: MessageBubbleProps) {
    const deleteMessage = useMutation(api.messages.deleteMessage);
    const toggleReaction = useMutation(api.reactions.toggleReaction);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteMessage({ messageId, userId: currentUserId });
        } catch {
            toast.error("Failed to delete message");
        }
    };

    const handleReaction = async (emoji: string) => {
        try {
            await toggleReaction({ messageId, userId: currentUserId, emoji });
            setShowReactionPicker(false);
        } catch {
            toast.error("Failed to add reaction");
        }
    };

    const hasMyReaction = (emoji: string) =>
        reactions
            .find((r) => r.emoji === emoji)
            ?.userIds.includes(currentUserId) ?? false;

    if (isDeleted) {
        return (
            <div
                className={cn(
                    "group flex gap-2.5 px-4 py-1 message-container",
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                )}
            >
                {!isOwnMessage && showAvatar && (
                    <UserAvatar src={senderImage} name={senderName} size="sm" />
                )}
                {!isOwnMessage && !showAvatar && <div className="w-8" />}
                <div
                    className={cn(
                        "flex flex-col",
                        isOwnMessage ? "items-end" : "items-start"
                    )}
                >
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-muted/30 border border-white/5">
                        <span className="text-muted-foreground text-sm">🚫</span>
                        <span className="text-sm italic text-muted-foreground">
                            This message was deleted
                        </span>
                    </div>
                    <span className="mt-1 text-[10px] text-muted-foreground px-1">
                        {formatMessageTime(createdAt)}
                    </span>
                </div>
                {isOwnMessage && <div className="w-8" />}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "group flex gap-2.5 px-4 py-0.5 message-container relative",
                isOwnMessage ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Avatar for incoming messages */}
            {!isOwnMessage && showAvatar && (
                <UserAvatar src={senderImage} name={senderName} size="sm" className="mt-5" />
            )}
            {!isOwnMessage && !showAvatar && <div className="w-8 shrink-0" />}

            {/* Message content */}
            <div
                className={cn(
                    "flex flex-col max-w-[65%]",
                    isOwnMessage ? "items-end" : "items-start"
                )}
            >
                {/* Sender name + timestamp header */}
                {showAvatar && (
                    <div className={cn(
                        "flex items-center gap-2 mb-1 px-1",
                        isOwnMessage ? "flex-row-reverse" : "flex-row"
                    )}>
                        <span className="text-xs font-medium text-foreground/80">
                            {isOwnMessage ? "You" : senderName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                            {formatMessageTime(createdAt)}
                        </span>
                    </div>
                )}

                <div className="relative group/bubble">
                    {/* Message actions (appear on hover) */}
                    <div
                        className={cn(
                            "message-actions absolute -top-2 flex items-center gap-1 bg-[oklch(0.2_0_0)] border border-white/10 rounded-lg px-1.5 py-0.5 shadow-lg z-10",
                            isOwnMessage ? "right-0" : "left-0"
                        )}
                    >
                        {/* Reaction picker trigger */}
                        <DropdownMenu
                            open={showReactionPicker}
                            onOpenChange={setShowReactionPicker}
                        >
                            <DropdownMenuTrigger asChild>
                                <button className="text-sm hover:scale-125 transition-transform">
                                    😊
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="flex gap-1 p-2 bg-[oklch(0.2_0_0)] border-white/10"
                                align={isOwnMessage ? "end" : "start"}
                            >
                                {REACTION_EMOJIS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReaction(emoji)}
                                        className={cn(
                                            "text-lg hover:scale-125 transition-transform p-0.5 rounded",
                                            hasMyReaction(emoji) && "bg-primary/20"
                                        )}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Delete (own messages only) */}
                        {isOwnMessage && (
                            <button
                                onClick={handleDelete}
                                className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Bubble */}
                    <div
                        className={cn(
                            "px-4 py-2.5 text-sm leading-relaxed",
                            isOwnMessage
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                : "bg-[var(--message-received)] text-foreground rounded-2xl rounded-tl-sm"
                        )}
                    >
                        {content}
                    </div>
                </div>

                {/* Reactions */}
                {reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 px-1">
                        {reactions.map((r) => (
                            <button
                                key={r.emoji}
                                onClick={() => handleReaction(r.emoji)}
                                className={cn(
                                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border transition-colors",
                                    hasMyReaction(r.emoji)
                                        ? "bg-primary/20 border-primary/40 text-primary"
                                        : "bg-white/5 border-white/10 text-foreground hover:bg-white/10"
                                )}
                            >
                                <span>{r.emoji}</span>
                                <span>{r.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Timestamp (for non-first messages in a group) */}
                {!showAvatar && (
                    <span className="mt-0.5 text-[10px] text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatMessageTime(createdAt)}
                    </span>
                )}
            </div>

            {isOwnMessage && <div className="w-8 shrink-0" />}
        </div>
    );
}
