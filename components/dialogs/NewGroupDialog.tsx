"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Search, Users } from "lucide-react";
import { usePresenceForUsers } from "@/hooks/usePresence";
import { toast } from "sonner";

interface NewGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId: Id<"users">;
}

export function NewGroupDialog({
    open,
    onOpenChange,
    currentUserId,
}: NewGroupDialogProps) {
    const { user } = useUser();
    const router = useRouter();
    const [groupName, setGroupName] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<Id<"users">>>(new Set());
    const [loading, setLoading] = useState(false);

    const users = useQuery(api.users.getUsers, {
        currentClerkId: user?.id ?? "",
    });

    const userIds = users?.map((u) => u._id) ?? [];
    const presenceList = usePresenceForUsers(userIds);

    const createGroup = useMutation(api.conversations.createGroup);

    const filtered = users?.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelect = (userId: Id<"users">) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return next;
        });
    };

    const getPresence = (userId: Id<"users">) =>
        presenceList?.find((p) => p.userId === userId);

    const handleCreate = async () => {
        if (!groupName.trim()) {
            toast.error("Please enter a group name");
            return;
        }
        if (selected.size < 1) {
            toast.error("Please select at least 1 member");
            return;
        }

        setLoading(true);
        try {
            const conversationId = await createGroup({
                name: groupName.trim(),
                memberIds: Array.from(selected),
                createdBy: currentUserId,
            });
            router.push(`/chat/${conversationId}`);
            onOpenChange(false);
            setGroupName("");
            setSelected(new Set());
        } catch {
            toast.error("Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setGroupName("");
        setSearch("");
        setSelected(new Set());
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-[oklch(0.16_0_0)] border-white/10 max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                            <span className="text-lg font-bold text-primary">k</span>
                        </div>
                        <DialogTitle className="text-lg font-semibold">
                            Create New Group
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="mt-2 space-y-4">
                    {/* Group Name */}
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                            Group Name
                        </label>
                        <Input
                            placeholder="e.g. Marketing Team"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="bg-white/5 border-white/10"
                        />
                    </div>

                    {/* Member Picker */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium text-foreground">
                                Add Members
                            </label>
                            {selected.size > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    {selected.size} selected
                                </span>
                            )}
                        </div>
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search people..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="max-h-52 overflow-y-auto flex flex-col gap-1">
                            {filtered?.map((u) => {
                                const isSelected = selected.has(u._id);
                                const presence = getPresence(u._id);
                                return (
                                    <button
                                        key={u._id}
                                        onClick={() => toggleSelect(u._id)}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${isSelected
                                                ? "bg-primary/10 border border-primary/40"
                                                : "hover:bg-white/5 border border-transparent"
                                            }`}
                                    >
                                        <UserAvatar
                                            src={u.imageUrl}
                                            name={u.name}
                                            isOnline={presence?.isOnline}
                                            size="md"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">
                                                {u.name}
                                            </div>
                                            <div className="text-xs">
                                                {presence?.isOnline ? (
                                                    <span className="text-[var(--online-green)]">
                                                        Online
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">Offline</span>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className={`h-5 w-5 rounded flex items-center justify-center border ${isSelected
                                                    ? "bg-primary border-primary"
                                                    : "border-white/20"
                                                }`}
                                        >
                                            {isSelected && (
                                                <svg
                                                    className="h-3 w-3 text-white"
                                                    viewBox="0 0 12 12"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M10 3L5 8.5L2 5.5"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}

                            {filtered?.length === 0 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    {search ? `No users found for "${search}"` : "No users available"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1 border-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={loading || !groupName.trim() || selected.size === 0}
                        className="flex-1 bg-primary hover:bg-primary/90 btn-primary-glow"
                    >
                        Create Group {selected.size > 0 && selected.size}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
