"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Smile, Send } from "lucide-react";
import { useTyping } from "@/hooks/useTyping";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { EmojiClickData } from "emoji-picker-react";
import { SmartReplies } from "./SmartReplies";

// Lazy-load the heavy picker so it doesn't bloat the initial bundle
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface MessageInputProps {
    conversationId: Id<"conversations">;
    currentUserId: Id<"users">;
    smartReplies?: string[];
}

export function MessageInput({
    conversationId,
    currentUserId,
    smartReplies = [],
}: MessageInputProps) {
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(false);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const sendMessage = useMutation(api.messages.sendMessage);
    const { handleTypingStart, handleTypingStop } = useTyping(
        conversationId,
        currentUserId
    );

    const handleSend = useCallback(async () => {
        const text = content.trim();
        if (!text || sending) return;

        setSending(true);
        setError(false);
        handleTypingStop();

        try {
            await sendMessage({
                conversationId,
                senderId: currentUserId,
                content: text,
            });
            setContent("");
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        } catch {
            setError(true);
            toast.error("Failed to send message", {
                action: {
                    label: "Retry",
                    onClick: handleSend,
                },
            });
        } finally {
            setSending(false);
        }
    }, [content, sending, conversationId, currentUserId, sendMessage, handleTypingStop]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        handleTypingStart();

        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = "auto";
            ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        const ta = textareaRef.current;
        const emoji = emojiData.emoji;
        if (ta) {
            const start = ta.selectionStart ?? content.length;
            const end = ta.selectionEnd ?? content.length;
            const newContent = content.slice(0, start) + emoji + content.slice(end);
            setContent(newContent);
            // Restore cursor after the inserted emoji
            requestAnimationFrame(() => {
                ta.focus();
                ta.selectionStart = ta.selectionEnd = start + emoji.length;
                ta.style.height = "auto";
                ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
            });
        } else {
            setContent((prev) => prev + emoji);
        }
        setEmojiOpen(false);
    };

    return (
        <div className="px-4 pb-4 pt-2">
            {/* Smart Reply Chips */}
            <SmartReplies
                replies={smartReplies}
                onSelect={(reply) => {
                    setContent(reply);
                    textareaRef.current?.focus();
                }}
            />

            {/* Emoji Picker */}
            {emojiOpen && (
                <div className="mb-2 flex justify-end">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={"dark" as never}
                        skinTonesDisabled
                        searchPlaceholder="Search emoji..."
                        height={380}
                        width={320}
                    />
                </div>
            )}

            <div
                className={cn(
                    "flex items-end gap-2 rounded-2xl border bg-[oklch(0.18_0_0)] px-3 py-2",
                    error ? "border-destructive/50" : "border-white/10",
                    "focus-within:border-primary/50 transition-colors"
                )}
            >
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-h-[32px] max-h-[120px] py-1"
                />

                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setEmojiOpen((o) => !o)}
                    className={cn(
                        "h-8 w-8 shrink-0 transition-colors",
                        emojiOpen
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                    )}
                >
                    <Smile className="h-4 w-4" />
                </Button>

                <Button
                    onClick={handleSend}
                    disabled={!content.trim() || sending}
                    size="icon"
                    className="h-8 w-8 shrink-0 bg-primary hover:bg-primary/90 btn-primary-glow"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                Press{" "}
                <kbd className="rounded border border-white/10 px-1 font-mono text-[10px]">
                    Enter
                </kbd>{" "}
                to send,{" "}
                <kbd className="rounded border border-white/10 px-1 font-mono text-[10px]">
                    Shift + Enter
                </kbd>{" "}
                for new line
            </p>
        </div>
    );
}
