"use client";

import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video, Info } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface ChatHeaderProps {
    name: string;
    imageUrl?: string | null;
    isOnline?: boolean;
    isGroup?: boolean;
    memberCount?: number;
    conversationId: Id<"conversations">;
}

export function ChatHeader({
    name,
    imageUrl,
    isOnline,
    isGroup,
    memberCount,
    conversationId,
}: ChatHeaderProps) {
    const router = useRouter();

    return (
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
                >
                    <Phone className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                    <Video className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                    <Info className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
