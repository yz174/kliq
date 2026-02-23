"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { AISummaryCard } from "@/components/chat/AISummaryCard";
import { ActionItemsPanel } from "@/components/chat/ActionItemsPanel";
import { usePresenceForUsers } from "@/hooks/usePresence";
import { useAIArtifacts } from "@/hooks/useAIArtifacts";

export default function ChatPage() {
    const { conversationId } = useParams<{ conversationId: string }>();
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                // Don't fire if user is typing in an input/textarea
                const tag = (e.target as HTMLElement).tagName;
                if (tag === "INPUT" || tag === "TEXTAREA") return;
                router.push("/");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    const meData = useQuery(
        api.users.getMe,
        user ? { clerkId: user.id } : "skip"
    );

    const conversation = useQuery(
        api.conversations.getConversationById,
        meData
            ? {
                conversationId: conversationId as Id<"conversations">,
                userId: meData._id as Id<"users">,
            }
            : "skip"
    );

    // Get partner user ID for DM presence
    const partnerIds =
        conversation?.type === "dm"
            ? (conversation.members as Array<{ _id: Id<"users"> }>)
                .filter((m) => m._id !== meData?._id)
                .map((m) => m._id)
            : [];

    const presenceList = usePresenceForUsers(partnerIds);
    const partnerIsOnline = presenceList?.[0]?.isOnline ?? false;

    // AI artifacts — subscribes in real-time, renders AI blocks when ready
    const { summary, actionItems, smartReplies } = useAIArtifacts(
        conversationId as Id<"conversations">
    );

    if (!meData || !conversation) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    const members = conversation.members as Array<{
        _id: Id<"users">;
        name: string;
        imageUrl?: string;
        email?: string;
    }>;

    const isGroup = conversation.type === "group";
    const partner = isGroup ? null : members.find((m) => m._id !== meData._id);

    const displayName = isGroup
        ? conversation.name ?? "Group"
        : partner?.name ?? "Unknown";

    const displayImage = isGroup ? null : partner?.imageUrl ?? null;

    return (
        <div className="flex h-full flex-col bg-[var(--chat-bg)]">
            <ChatHeader
                name={displayName}
                imageUrl={displayImage}
                isOnline={isGroup ? undefined : partnerIsOnline}
                isGroup={isGroup}
                memberCount={isGroup ? members.length : undefined}
                conversationId={conversationId as Id<"conversations">}
                members={members}
                currentUserId={meData._id as Id<"users">}
            />

            {/* AI Blocks — rendered between header and messages */}
            {summary && <AISummaryCard artifact={summary} />}
            {actionItems && <ActionItemsPanel artifact={actionItems} />}

            <MessageList
                conversationId={conversationId as Id<"conversations">}
                currentUserId={meData._id as Id<"users">}
            />

            <MessageInput
                conversationId={conversationId as Id<"conversations">}
                currentUserId={meData._id as Id<"users">}
                smartReplies={smartReplies}
            />
        </div>
    );
}
