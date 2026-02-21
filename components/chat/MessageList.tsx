"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { SkeletonMessage } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { ArrowDown, MessageSquare } from "lucide-react";
import {
    shouldShowDateDivider,
    formatDateDivider,
} from "@/lib/formatDate";
import { useMutation } from "convex/react";

interface MessageListProps {
    conversationId: Id<"conversations">;
    currentUserId: Id<"users">;
}

export function MessageList({
    conversationId,
    currentUserId,
}: MessageListProps) {
    const messages = useQuery(api.messages.getMessages, { conversationId });
    const typingUsers = useQuery(api.typing.getTypingUsers, {
        conversationId,
        currentUserId,
    });
    const markAsRead = useMutation(api.conversations.markAsRead);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const prevMessageCount = useRef(0);

    const scrollToBottom = useCallback((smooth = true) => {
        bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
        setHasNewMessages(false);
    }, []);

    // Track scroll position
    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setIsAtBottom(distFromBottom < 80);
        if (distFromBottom < 80) setHasNewMessages(false);
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        if (!messages) return;
        const newCount = messages.length;
        if (newCount > prevMessageCount.current) {
            if (isAtBottom) {
                scrollToBottom(prevMessageCount.current === 0 ? false : true);
            } else if (prevMessageCount.current > 0) {
                // Someone sent a message while user scrolled up
                const lastMsg = messages[messages.length - 1];
                if (lastMsg?.senderId === currentUserId) {
                    scrollToBottom(true);
                } else {
                    setHasNewMessages(true);
                }
            }
        }
        prevMessageCount.current = newCount;
    }, [messages, isAtBottom, currentUserId, scrollToBottom]);

    // Mark as read when viewing
    useEffect(() => {
        if (!messages || messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg) {
            markAsRead({
                conversationId,
                userId: currentUserId,
                lastMessageId: lastMsg._id,
            });
        }
    }, [messages, conversationId, currentUserId, markAsRead]);

    if (messages === undefined) return <SkeletonMessage />;

    if (messages.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Send a message to start the conversation!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex-1 overflow-hidden">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto py-4 flex flex-col"
            >
                {messages.map((msg, idx) => {
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const showDivider = shouldShowDateDivider(msg, prevMsg);
                    // Show avatar if first message or different sender than previous
                    const showAvatar =
                        !prevMsg || prevMsg.senderId !== msg.senderId || showDivider;

                    return (
                        <div key={msg._id}>
                            {showDivider && (
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className="flex-1 h-px bg-white/5" />
                                    <span className="text-xs text-muted-foreground bg-[var(--chat-bg)] px-2 py-0.5 rounded-full border border-white/5">
                                        {formatDateDivider(msg.createdAt)}
                                    </span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>
                            )}
                            <MessageBubble
                                messageId={msg._id}
                                content={msg.content}
                                senderId={msg.senderId}
                                senderName={msg.sender?.name ?? "Unknown"}
                                senderImage={msg.sender?.imageUrl}
                                createdAt={msg.createdAt}
                                isOwnMessage={msg.senderId === currentUserId}
                                isDeleted={msg.isDeleted}
                                reactions={msg.reactions}
                                currentUserId={currentUserId}
                                showAvatar={showAvatar}
                            />
                        </div>
                    );
                })}

                {/* Typing indicator */}
                {typingUsers && typingUsers.length > 0 && (
                    <TypingIndicator
                        names={typingUsers.map((u) => u?.name ?? "Someone").filter(Boolean) as string[]}
                        imageUrls={typingUsers.map((u) => u?.imageUrl ?? null)}
                    />
                )}

                <div ref={bottomRef} />
            </div>

            {/* New messages button */}
            {hasNewMessages && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <Button
                        onClick={() => scrollToBottom(true)}
                        size="sm"
                        className="gap-2 rounded-full bg-primary shadow-lg btn-primary-glow"
                    >
                        <ArrowDown className="h-4 w-4" />
                        New messages
                    </Button>
                </div>
            )}
        </div>
    );
}
