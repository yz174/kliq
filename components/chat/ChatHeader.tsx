"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ArrowLeft, Info, LogOut, Search, UserPlus, X } from "lucide-react";
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
    conversationId,
    members = [],
    currentUserId,
}: ChatHeaderProps) {
    const router = useRouter();
    const { user: clerkUser } = useUser();
    const [infoOpen, setInfoOpen] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [addSearch, setAddSearch] = useState("");
    const [adding, setAdding] = useState<Id<"users"> | null>(null);

    const leaveGroupMutation = useMutation(api.conversations.leaveGroup);
    const addGroupMemberMutation = useMutation(api.conversations.addGroupMember);

    const allUsers = useQuery(
        api.users.getUsers,
        isGroup && clerkUser?.id ? { currentClerkId: clerkUser.id } : "skip"
    );

    const existingMemberIds = new Set(members.map((m) => m._id));
    const addableUsers = allUsers
        ?.filter((u) => !existingMemberIds.has(u._id))
        .filter((u) => u.name.toLowerCase().includes(addSearch.toLowerCase()));

    const partner = !isGroup ? members.find((m) => m._id !== currentUserId) : null;

    async function handleAddMember(userId: Id<"users">) {
        if (!currentUserId) return;
        try {
            setAdding(userId);
            await addGroupMemberMutation({ conversationId, userId, addedByUserId: currentUserId });
            setAddSearch("");
            setShowAddMember(false);
        } catch (e) {
            console.error(e);
        } finally {
            setAdding(null);
        }
    }

    async function handleLeaveGroup() {
        if (!currentUserId) return;
        if (!confirmLeave) {
            setConfirmLeave(true);
            return;
        }
        try {
            setLeaving(true);
            await leaveGroupMutation({ conversationId: conversationId, userId: currentUserId });
            setInfoOpen(false);
            router.push("/");
        } catch (e) {
            console.error(e);
        } finally {
            setLeaving(false);
            setConfirmLeave(false);
        }
    }

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

                            <div className="flex-1 overflow-y-auto">

                                {/* ── Add People Card ── */}
                                <div className="px-4 pt-3 pb-2">
                                    <button
                                        onClick={() => { setShowAddMember((v) => !v); setAddSearch(""); }}
                                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors text-left"
                                    >
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 shrink-0">
                                            <UserPlus className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium text-primary flex-1">Add People</span>
                                        {showAddMember && <X className="h-3.5 w-3.5 text-primary/60" />}
                                    </button>

                                    {/* Search panel */}
                                    {showAddMember && (
                                        <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
                                            <div className="relative border-b border-white/8">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search people..."
                                                    value={addSearch}
                                                    onChange={(e) => setAddSearch(e.target.value)}
                                                    className="pl-9 h-9 text-sm bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="max-h-44 overflow-y-auto">
                                                {!allUsers && (
                                                    <p className="text-xs text-muted-foreground text-center py-5">Loading…</p>
                                                )}
                                                {allUsers && addableUsers?.length === 0 && (
                                                    <p className="text-xs text-muted-foreground text-center py-5">
                                                        {addSearch ? `No results for "${addSearch}"` : "Everyone is already in this group"}
                                                    </p>
                                                )}
                                                {addableUsers?.map((u) => (
                                                    <button
                                                        key={u._id}
                                                        disabled={adding === u._id}
                                                        onClick={() => handleAddMember(u._id)}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 text-left transition-colors disabled:opacity-50"
                                                    >
                                                        <UserAvatar src={u.imageUrl} name={u.name} size="sm" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium truncate">{u.name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                                        </div>
                                                        {adding === u._id ? (
                                                            <span className="text-[10px] text-muted-foreground shrink-0">Adding…</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full shrink-0">Add</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ── Member List ── */}
                                <div className="px-4 pt-1 pb-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">
                                        Members · {memberCount ?? members.length}
                                    </p>
                                    <div className="flex flex-col gap-0.5">
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

                            {/* Leave Group */}
                            <div className="px-4 pb-5 pt-2 border-t border-white/5">
                                {confirmLeave ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs text-muted-foreground text-center">
                                            Are you sure you want to leave this group?
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1 text-muted-foreground"
                                                onClick={() => setConfirmLeave(false)}
                                                disabled={leaving}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                                onClick={handleLeaveGroup}
                                                disabled={leaving}
                                            >
                                                {leaving ? "Leaving…" : "Leave"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
                                        onClick={handleLeaveGroup}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Leave Group
                                    </Button>
                                )}
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
