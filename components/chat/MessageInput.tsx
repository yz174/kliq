"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Smile, Send, Sparkles, ListTodo, MessageSquarePlus } from "lucide-react";
import { useTyping } from "@/hooks/useTyping";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { EmojiClickData } from "emoji-picker-react";
import { SmartReplies } from "./SmartReplies";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

// ── Command palette definitions ─────────────────────────────────────────────
const AI_COMMANDS = [
    {
        name: "/summarize",
        command: "summary",
        description: "Summarize recent conversation",
        icon: Sparkles,
        color: "text-violet-400",
    },
    {
        name: "/action-items",
        command: "actions",
        description: "Extract tasks & decisions",
        icon: ListTodo,
        color: "text-amber-400",
    },
    {
        name: "/reply",
        command: "reply",
        description: "Suggest contextual replies",
        icon: MessageSquarePlus,
        color: "text-sky-400",
    },
] as const;

interface MessageInputProps {
    conversationId: Id<"conversations">;
    currentUserId: Id<"users">;
    smartReplies?: string[];
    smartRepliesLoading?: boolean;
    onCommandTriggered?: (command: string) => void;
}

export function MessageInput({
    conversationId,
    currentUserId,
    smartReplies = [],
    smartRepliesLoading = false,
    onCommandTriggered,
}: MessageInputProps) {
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(false);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [selectedCommandIdx, setSelectedCommandIdx] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const paletteRef = useRef<HTMLDivElement>(null);

    const sendMessage = useMutation(api.messages.sendMessage);
    const triggerAICommand = useMutation(api.messages.triggerAICommand);
    const { handleTypingStart, handleTypingStop } = useTyping(
        conversationId,
        currentUserId
    );

    // Filter commands based on what's typed after "/"
    const filteredCommands = content.startsWith("/")
        ? AI_COMMANDS.filter((c) =>
              c.name.startsWith(content.trim().toLowerCase())
          )
        : [];

    // Open/close palette
    useEffect(() => {
        if (content.startsWith("/") && filteredCommands.length > 0) {
            setCommandPaletteOpen(true);
            setSelectedCommandIdx(0);
        } else {
            setCommandPaletteOpen(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    const execCommand = useCallback(
        async (command: string) => {
            setSending(true);
            setError(false);
            handleTypingStop();
            setContent("");
            setCommandPaletteOpen(false);
            if (textareaRef.current) textareaRef.current.style.height = "auto";

            try {
                await triggerAICommand({ conversationId, userId: currentUserId, command });
                onCommandTriggered?.(command);
            } catch {
                toast.error("Failed to run command. Try again.");
            } finally {
                setSending(false);
            }
        },
        [conversationId, currentUserId, triggerAICommand, handleTypingStop, onCommandTriggered]
    );

    const handleSend = useCallback(async () => {
        const text = content.trim();
        if (!text || sending) return;

        // If it's a slash-command, run it without sending a message
        const matched = AI_COMMANDS.find((c) => c.name === text.split(" ")[0]);
        if (matched) {
            await execCommand(matched.command);
            return;
        }

        setSending(true);
        setError(false);
        handleTypingStop();

        try {
            await sendMessage({ conversationId, senderId: currentUserId, content: text });
            setContent("");
            if (textareaRef.current) textareaRef.current.style.height = "auto";
        } catch {
            setError(true);
            toast.error("Failed to send message", {
                action: { label: "Retry", onClick: handleSend },
            });
        } finally {
            setSending(false);
        }
    }, [content, sending, conversationId, currentUserId, sendMessage, handleTypingStop, execCommand]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (commandPaletteOpen) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedCommandIdx((i) => (i + 1) % filteredCommands.length);
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedCommandIdx((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
                return;
            }
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                execCommand(filteredCommands[selectedCommandIdx].command);
                return;
            }
            if (e.key === "Escape") {
                e.preventDefault();
                setCommandPaletteOpen(false);
                return;
            }
            if (e.key === "Tab") {
                e.preventDefault();
                setContent(filteredCommands[selectedCommandIdx].name + " ");
                return;
            }
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (!e.target.value.startsWith("/")) handleTypingStart();

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
        <div className="border-t border-white/[0.08] px-4 pb-4 pt-2">
            {/* Smart Reply Chips */}
            <SmartReplies
                replies={smartReplies}
                loading={smartRepliesLoading}
                onSelect={(reply) => {
                    setContent(reply);
                    textareaRef.current?.focus();
                }}
            />

            {/* Command Palette */}
            {commandPaletteOpen && filteredCommands.length > 0 && (
                <div
                    ref={paletteRef}
                    className="mb-2 overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.16_0_0)] shadow-xl"
                >
                    <div className="border-b border-white/5 px-3 py-1.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            AI Commands
                        </span>
                    </div>
                    {filteredCommands.map((cmd, idx) => {
                        const Icon = cmd.icon;
                        return (
                            <button
                                key={cmd.name}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // prevent textarea blur
                                    execCommand(cmd.command);
                                }}
                                onMouseEnter={() => setSelectedCommandIdx(idx)}
                                className={cn(
                                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                                    idx === selectedCommandIdx
                                        ? "bg-white/[0.06]"
                                        : "hover:bg-white/[0.03]"
                                )}
                            >
                                <Icon className={cn("h-4 w-4 shrink-0", cmd.color)} />
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-foreground">
                                        {cmd.name}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {cmd.description}
                                    </span>
                                </div>
                                {idx === selectedCommandIdx && (
                                    <span className="ml-auto text-[10px] text-muted-foreground">
                                        Enter ↵
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

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
                    placeholder="Type a message or / for AI commands…"
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
                        emojiOpen ? "text-primary" : "text-muted-foreground hover:text-primary"
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
