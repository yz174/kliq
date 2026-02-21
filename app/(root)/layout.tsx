"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { useUserSync } from "@/hooks/useUserSync";
import { usePresence } from "@/hooks/usePresence";
import { Id } from "@/convex/_generated/dataModel";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoaded } = useUser();

    // Sync user to Convex on login
    useUserSync();

    const meData = useQuery(
        api.users.getMe,
        user ? { clerkId: user.id } : "skip"
    );

    // Track online presence
    usePresence(meData?._id as Id<"users"> | undefined);

    // Show full-screen spinner while Clerk or Convex user is loading
    if (!isLoaded || (user && meData === undefined)) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--chat-bg)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20">
                        <span className="text-2xl font-bold text-primary">k</span>
                    </div>
                    <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--chat-bg)]">
            {meData && (
                <Sidebar currentUserId={meData._id as Id<"users">} />
            )}
            <main className="flex flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
