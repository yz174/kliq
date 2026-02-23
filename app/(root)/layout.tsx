"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { useUserSync } from "@/hooks/useUserSync";
import { usePresence } from "@/hooks/usePresence";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();

    // Sync user to Convex on login
    useUserSync();

    const meData = useQuery(
        api.users.getMe,
        user ? { clerkId: user.id } : "skip"
    );

    // Track online presence
    usePresence(meData?._id as Id<"users"> | undefined);

    // On mobile: true when a chat is open
    const isChatOpen = pathname?.startsWith("/chat/");

    // Show full-screen spinner while Clerk or Convex user is loading
    if (!isLoaded || (user && meData === undefined)) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--chat-bg)]">
                <Image
                    src="/logo.png"
                    alt="Kliq"
                    width={72}
                    height={72}
                    className="animate-bounce rounded-2xl"
                    priority
                />
            </div>
        );
    }

    return (
        <div className="relative flex h-screen overflow-hidden bg-[var(--chat-bg)]">
            {/* Sidebar panel */}
            <div
                className={cn(
                    // Mobile: absolutely positioned, full screen, slides left when chat opens
                    "absolute inset-0 z-10 flex h-full w-full",
                    "transition-transform duration-300 ease-in-out",
                    "md:relative md:inset-auto md:z-auto md:w-auto md:translate-x-0",
                    isChatOpen ? "-translate-x-full" : "translate-x-0"
                )}
            >
                {meData && (
                    <Sidebar currentUserId={meData._id as Id<"users">} />
                )}
            </div>

            {/* Chat / empty-state panel */}
            <main
                className={cn(
                    // Mobile: absolutely positioned, full screen, slides in from right when chat opens
                    "absolute inset-0 z-20 flex h-full w-full flex-col overflow-hidden",
                    "transition-transform duration-300 ease-in-out",
                    "md:relative md:inset-auto md:z-auto md:flex-1 md:translate-x-0",
                    isChatOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {children}
            </main>
        </div>
    );
}
