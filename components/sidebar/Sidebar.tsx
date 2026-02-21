"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConversationItem } from "./ConversationItem";
import { SkeletonSidebar } from "@/components/shared/SkeletonLoader";
import { UserSearchDialog } from "@/components/dialogs/UserSearchDialog";
import { NewGroupDialog } from "@/components/dialogs/NewGroupDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MessageSquarePlus, Users, Settings, ChevronDown, Lock } from "lucide-react";
import Image from "next/image";
import { usePresenceForUsers } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";

interface SidebarProps {
    currentUserId: Id<"users">;
}

type FilterTab = "all" | "unread" | "groups";

export function Sidebar({ currentUserId }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useUser();
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [userSearchOpen, setUserSearchOpen] = useState(false);
    const [groupDialogOpen, setGroupDialogOpen] = useState(false);

    const conversations = useQuery(api.conversations.getUserConversations, {
        userId: currentUserId,
    });

    // Collect all DM partner IDs for presence
    const dmPartnerIds = conversations
        ?.filter((c) => c?.type === "dm")
        .flatMap((c) =>
            (c?.members as Array<{ _id: Id<"users"> }> | undefined)
                ?.filter((m) => m._id !== currentUserId)
                .map((m) => m._id) ?? []
        ) ?? [];

    const presenceList = usePresenceForUsers(dmPartnerIds);

    const getPartnerPresence = (members: Array<{ _id: Id<"users"> }>) => {
        const partner = members.find((m) => m._id !== currentUserId);
        if (!partner) return false;
        return presenceList?.find((p) => p.userId === partner._id)?.isOnline ?? false;
    };

    const getConvDisplayName = (conv: NonNullable<typeof conversations>[number]) => {
        if (!conv) return "";
        if (conv.type === "group") return conv.name ?? "Group";
        const partner = (conv.members as Array<{ _id: Id<"users">; name: string }> | undefined)?.find(
            (m) => m._id !== currentUserId
        );
        return partner?.name ?? "Unknown";
    };

    const getConvImage = (conv: NonNullable<typeof conversations>[number]) => {
        if (!conv || conv.type === "group") return null;
        const partner = (conv.members as Array<{ _id: Id<"users">; imageUrl?: string }> | undefined)?.find(
            (m) => m._id !== currentUserId
        );
        return partner?.imageUrl ?? null;
    };

    const dmConversations = conversations?.filter((c) => c?.type === "dm") ?? [];
    const groupConversations = conversations?.filter((c) => c?.type === "group") ?? [];

    const filterAndSearchConvs = <T extends NonNullable<typeof dmConversations[number]>>(convs: T[]) =>
        convs.filter((c) => {
            if (!c) return false;
            const name = getConvDisplayName(c);
            const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
            const matchesUnread = activeTab === "unread" ? (c.unreadCount ?? 0) > 0 : true;
            return matchesSearch && matchesUnread;
        });

    const activeConvId = pathname?.startsWith("/chat/")
        ? pathname.split("/chat/")[1]
        : null;

    const tabCounts = {
        all: (dmConversations.length + groupConversations.length),
        unread: [...dmConversations, ...groupConversations].filter(c => (c?.unreadCount ?? 0) > 0).length,
        groups: groupConversations.length,
    };

    // Determine what to show based on tab
    const showDMs = activeTab === "all" || activeTab === "unread";
    const showGroups = activeTab === "all" || activeTab === "groups" || activeTab === "unread";

    const filteredDMs = showDMs ? filterAndSearchConvs(dmConversations) : [];
    const filteredGroups = showGroups ? filterAndSearchConvs(groupConversations) : [];

    return (
        <>
            <aside className="flex h-full w-96 shrink-0 flex-col bg-[var(--sidebar-bg)] border-r border-white/5">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="Kliq logo"
                            width={80}
                            height={32}
                            priority
                            className="select-none object-contain mix-blend-screen"
                        />
                    </div>

                    {/* New Chat button + dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="flex-1 ml-3 gap-2 bg-primary hover:bg-primary/90 text-sm btn-primary-glow"
                            >
                                <MessageSquarePlus className="h-4 w-4" />
                                New Chat
                                <ChevronDown className="h-3 w-3 ml-auto opacity-70" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-[oklch(0.18_0_0)] border-white/10 w-44"
                        >
                            <DropdownMenuItem
                                onClick={() => setUserSearchOpen(true)}
                                className="gap-2 cursor-pointer"
                            >
                                <MessageSquarePlus className="h-4 w-4" />
                                Direct Message
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setGroupDialogOpen(true)}
                                className="gap-2 cursor-pointer"
                            >
                                <Users className="h-4 w-4" />
                                New Group
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Search */}
                <div className="px-3 pt-3 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search conversations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 h-9 text-xs bg-white/5 border-white/10 rounded-xl"
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 px-3 pb-2">
                    {(["all", "unread", "groups"] as FilterTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition-all",
                                activeTab === tab
                                    ? "bg-primary/20 text-primary"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}
                        >
                            {tab}
                            {tab !== "all" && tabCounts[tab] > 0 && (
                                <span className={cn(
                                    "ml-1 text-[10px] font-bold",
                                    activeTab === tab ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {tabCounts[tab]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto px-2 pb-2">
                    {conversations === undefined ? (
                        <SkeletonSidebar />
                    ) : (
                        <>
                            {/* Direct Messages */}
                            {filteredDMs.length > 0 && (
                                <>
                                    {activeTab === "all" && (
                                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                            Direct Messages
                                        </div>
                                    )}
                                    {filteredDMs.map((conv) => {
                                        if (!conv) return null;
                                        const members = conv.members as Array<{ _id: Id<"users">; name: string; imageUrl?: string }>;
                                        const name = getConvDisplayName(conv);
                                        const imageUrl = getConvImage(conv);
                                        const isOnline = getPartnerPresence(members);
                                        const lastMsg = conv.lastMessage;
                                        return (
                                            <ConversationItem
                                                key={conv._id}
                                                id={conv._id}
                                                name={name}
                                                imageUrl={imageUrl}
                                                lastMessage={
                                                    lastMsg?.isDeleted
                                                        ? "This message was deleted"
                                                        : lastMsg?.content
                                                }
                                                lastMessageTime={conv.lastMessageTime}
                                                unreadCount={conv.unreadCount}
                                                isActive={activeConvId === conv._id}
                                                isOnline={isOnline}
                                            />
                                        );
                                    })}
                                </>
                            )}

                            {/* Groups */}
                            {filteredGroups.length > 0 && (
                                <>
                                    {(activeTab === "all" || activeTab === "groups") && (
                                        <div className="px-3 py-1.5 mt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                            Groups
                                        </div>
                                    )}
                                    {filteredGroups.map((conv) => {
                                        if (!conv) return null;
                                        const members = conv.members as Array<{ _id: Id<"users"> }>;
                                        const lastMsg = conv.lastMessage;
                                        return (
                                            <ConversationItem
                                                key={conv._id}
                                                id={conv._id}
                                                name={conv.name ?? "Group"}
                                                lastMessage={
                                                    lastMsg?.isDeleted
                                                        ? "This message was deleted"
                                                        : lastMsg?.content
                                                }
                                                lastMessageTime={conv.lastMessageTime}
                                                unreadCount={conv.unreadCount}
                                                isActive={activeConvId === conv._id}
                                                isGroup
                                                memberCount={members.length}
                                            />
                                        );
                                    })}
                                </>
                            )}

                            {/* Empty State */}
                            {conversations.length === 0 && (
                                <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                                        <MessageSquarePlus className="h-7 w-7 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">No conversations yet</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Start by messaging someone
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* No search results */}
                            {conversations.length > 0 && search && filteredDMs.length === 0 && filteredGroups.length === 0 && (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No results for &ldquo;{search}&rdquo;
                                </div>
                            )}

                            {/* No unread */}
                            {activeTab === "unread" && tabCounts.unread === 0 && (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No unread messages
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* User Footer */}
                <div className="border-t border-white/5 px-4 py-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <UserButton afterSignOutUrl="/sign-in" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {user?.fullName ?? user?.username}
                                </p>
                                <p className="text-xs text-[var(--online-green)]">Online</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                    {/* Encrypted notice */}
                    <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        Your messages are end-to-end encrypted
                    </p>
                </div>
            </aside>

            <UserSearchDialog
                open={userSearchOpen}
                onOpenChange={setUserSearchOpen}
                currentUserId={currentUserId}
            />
            <NewGroupDialog
                open={groupDialogOpen}
                onOpenChange={setGroupDialogOpen}
                currentUserId={currentUserId}
            />
        </>
    );
}
