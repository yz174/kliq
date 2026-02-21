"use client";

import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import { formatConversationTime } from "@/lib/formatDate";
import { Id } from "@/convex/_generated/dataModel";

interface ConversationItemProps {
    id: Id<"conversations">;
    name: string;
    imageUrl?: string | null;
    lastMessage?: string | null;
    lastMessageTime?: number | null;
    unreadCount?: number;
    isActive?: boolean;
    isOnline?: boolean;
    isGroup?: boolean;
    memberCount?: number;
}

export function ConversationItem({
    id,
    name,
    imageUrl,
    lastMessage,
    lastMessageTime,
    unreadCount = 0,
    isActive = false,
    isOnline,
    isGroup = false,
    memberCount,
}: ConversationItemProps) {
    const router = useRouter();
    const hasUnread = unreadCount > 0;

    return (
        <button
            onClick={() => router.push(`/chat/${id}`)}
            className={cn(
                "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                "hover:bg-white/5",
                isActive && "bg-white/10"
            )}
        >
            {/* Active left accent bar */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-r-full bg-primary" />
            )}

            {isGroup ? (
                <div className="relative shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10">
                    <span className="text-lg">👥</span>
                </div>
            ) : (
                <UserAvatar
                    src={imageUrl}
                    name={name}
                    isOnline={isOnline}
                    size="md"
                />
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        "truncate text-sm",
                        hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground"
                    )}>
                        {name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {lastMessageTime && (
                            <span className={cn(
                                "text-[10px]",
                                hasUnread ? "text-primary font-medium" : "text-muted-foreground"
                            )}>
                                {formatConversationTime(lastMessageTime)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className={cn(
                        "truncate text-xs",
                        hasUnread ? "text-foreground/80" : "text-muted-foreground"
                    )}>
                        {isGroup && memberCount ? `${memberCount} members · ` : ""}
                        {lastMessage ?? "No messages yet"}
                    </span>
                    {hasUnread && (
                        <span className="shrink-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
