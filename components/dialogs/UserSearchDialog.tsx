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
import { Search, X } from "lucide-react";
import { usePresenceForUsers } from "@/hooks/usePresence";

interface UserSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId: Id<"users">;
}

export function UserSearchDialog({
    open,
    onOpenChange,
    currentUserId,
}: UserSearchDialogProps) {
    const { user } = useUser();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const users = useQuery(api.users.getUsers, {
        currentClerkId: user?.id ?? "",
    });

    const userIds = users?.map((u) => u._id) ?? [];
    const presenceList = usePresenceForUsers(userIds);

    const getOrCreateDM = useMutation(api.conversations.getOrCreateDM);

    const filtered = users?.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleUserClick = async (otherUserId: Id<"users">) => {
        setLoading(true);
        try {
            const conversationId = await getOrCreateDM({
                currentUserId,
                otherUserId,
            });
            router.push(`/chat/${conversationId}`);
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    const getPresence = (userId: Id<"users">) =>
        presenceList?.find((p) => p.userId === userId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[oklch(0.16_0_0)] border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        New Conversation
                    </DialogTitle>
                </DialogHeader>

                <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search people..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    )}
                </div>

                <div className="mt-2 max-h-72 overflow-y-auto flex flex-col gap-1">
                    {!users && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    )}
                    {users && filtered?.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            {search ? `No users found for "${search}"` : "No users yet"}
                        </div>
                    )}
                    {filtered?.map((u) => {
                        const presence = getPresence(u._id);
                        return (
                            <button
                                key={u._id}
                                onClick={() => handleUserClick(u._id)}
                                disabled={loading}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 text-left transition-colors"
                            >
                                <UserAvatar
                                    src={u.imageUrl}
                                    name={u.name}
                                    isOnline={presence?.isOnline}
                                    size="md"
                                />
                                <div>
                                    <div className="text-sm font-medium">{u.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {presence?.isOnline ? (
                                            <span className="text-[var(--online-green)]">Online</span>
                                        ) : (
                                            "Offline"
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
