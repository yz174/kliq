"use client";

import { useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const TYPING_DEBOUNCE_MS = 2000;

export function useTyping(
    conversationId: Id<"conversations"> | undefined,
    userId: Id<"users"> | undefined
) {
    const setTyping = useMutation(api.typing.setTyping);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);

    const handleTypingStart = useCallback(() => {
        if (!conversationId || !userId) return;

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            setTyping({ conversationId, userId, isTyping: true });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                setTyping({ conversationId, userId, isTyping: false });
            }
        }, TYPING_DEBOUNCE_MS);
    }, [conversationId, userId, setTyping]);

    const handleTypingStop = useCallback(() => {
        if (!conversationId || !userId) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (isTypingRef.current) {
            isTypingRef.current = false;
            setTyping({ conversationId, userId, isTyping: false });
        }
    }, [conversationId, userId, setTyping]);

    return { handleTypingStart, handleTypingStop };
}
