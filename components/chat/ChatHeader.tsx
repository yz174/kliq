"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ArrowLeft, Info } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface Member {
    _id: Id<"users">;
    name: string;
    imageUrl?: string;
    email?: string;
}

interface ChatHeaderProps {
    name: string;
    imageUrl?: string | null;
    isOnline?: boolean;
    isGroup?: boolean;
    memberCount?: number;
    conversationId: Id<"conversations">;
    members?: Member[];
    currentUserId?: Id<"users">;
}

export function ChatHeader({
    name,
    imageUrl,
    isOnline,
    isGroup,
    memberCount,
    members = [],
    currentUserId,
}: ChatHeaderProps) {
    const router = useRouter();
    const [infoOpen, setInfoOpen] = useState(false);

    const partner = !isGroup ? members.find((m) => m._id !== currentUserId) : null;

    return (
        <>
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4 bg-[var(--chat-bg)]">
                <div className="flex items-center gap-3">
                    {/* Mobile back button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-8 w-8"
                        onClick={() => router.push("/")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    {isGroup ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                            <span className="text-lg">👥</span>
                        </div>
                    ) : (
                        <UserAvatar src={imageUrl} name={name} isOnline={isOnline} size="md" />
                    )}

                    <div>
                        <h2 className="text-sm font-semibold">{name}</h2>
                        <p className="text-xs text-muted-foreground">
                            {isGroup
                                ? `${memberCount ?? 0} members`
                                : isOnline
                                    ? "Active now"
                                    : "Offline"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        onClick={() => setInfoOpen(true)}
                    >
                        <Info className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Info Panel */}
            <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
                <SheetContent
                    side="right"
                    className="w-80 bg-[oklch(0.16_0_0)] border-l border-white/5 p-0"
                >
                    {isGroup ? (
                        /* ── Group Info ── */
                        <div className="flex flex-col h-full">
                            <SheetHeader className="px-5 pt-6 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-2xl shrink-0">
                                        👥
                                    </div>
                                    <div className="min-w-0">
                                        <SheetTitle className="text-base font-semibold text-left">
                                            {name}
                                        </SheetTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {memberCount ?? members.length} members
                                        </p>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto px-4 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                                    Members
                                </p>
                                <div className="flex flex-col gap-1">
                                    {members.map((m) => {
                                        const isMe = m._id === currentUserId;
                                        return (
                                            <div
                                                key={m._id}
                                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
                                            >
                                                <UserAvatar
                                                    src={m.imageUrl}
                                                    name={m.name}
                                                    size="sm"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">
                                                        {isMe ? "Me" : m.name}
                                                    </p>
                                                    {m.email && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {m.email}
                                                        </p>
                                                    )}
                                                </div>
                                                {isMe && (
                                                    <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full shrink-0">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── DM Info ── */
                        <div className="flex flex-col h-full">
                            <SheetHeader className="px-5 pt-6 pb-4 border-b border-white/5">
                                <SheetTitle className="sr-only">Contact Info</SheetTitle>
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <UserAvatar
                                        src={partner?.imageUrl ?? imageUrl}
                                        name={partner?.name ?? name}
                                        isOnline={isOnline}
                                        size="lg"
                                    />
                                    <div>
                                        <p className="text-base font-semibold">
                                            {partner?.name ?? name}
                                        </p>
                                        <p className="text-xs mt-0.5">
                                            {isOnline ? (
                                                <span className="text-[var(--online-green)]">Active now</span>
                                            ) : (
                                                <span className="text-muted-foreground">Offline</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="px-5 py-4 flex flex-col gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                        Email
                                    </p>
                                    <p className="text-sm text-foreground bg-white/5 rounded-lg px-3 py-2 break-all">
                                        {partner?.email ?? "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                        Name
                                    </p>
                                    <p className="text-sm text-foreground bg-white/5 rounded-lg px-3 py-2">
                                        {partner?.name ?? name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
