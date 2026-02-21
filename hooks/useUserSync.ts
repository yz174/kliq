"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useUserSync() {
    const { user, isLoaded } = useUser();
    const upsertUser = useMutation(api.users.upsertUser);

    useEffect(() => {
        if (!isLoaded || !user) return;

        upsertUser({
            clerkId: user.id,
            name: user.fullName ?? user.username ?? "Anonymous",
            email: user.primaryEmailAddress?.emailAddress ?? "",
            imageUrl: user.imageUrl,
        });
    }, [isLoaded, user, upsertUser]);
}
