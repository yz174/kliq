"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function usePresence(userId?: Id<"users">) {
    const setPresence = useMutation(api.presence.setPresence);

    useEffect(() => {
        if (!userId) return;

        // Set online on mount
        setPresence({ userId, isOnline: true });

        // Set offline on unmount / tab close
        const handleOffline = () => setPresence({ userId, isOnline: false });
        window.addEventListener("beforeunload", handleOffline);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                setPresence({ userId, isOnline: false });
            } else {
                setPresence({ userId, isOnline: true });
            }
        });

        return () => {
            handleOffline();
            window.removeEventListener("beforeunload", handleOffline);
        };
    }, [userId, setPresence]);
}

export function usePresenceForUsers(userIds: Id<"users">[]) {
    return useQuery(api.presence.getPresence, { userIds });
}
