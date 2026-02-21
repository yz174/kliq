"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
    src?: string | null;
    name: string;
    size?: "sm" | "md" | "lg";
    isOnline?: boolean;
    className?: string;
}

const sizeMap = {
    sm: { container: "h-8 w-8", text: "text-xs" },
    md: { container: "h-10 w-10", text: "text-sm" },
    lg: { container: "h-12 w-12", text: "text-base" },
};

export function UserAvatar({
    src,
    name,
    size = "md",
    isOnline,
    className,
}: UserAvatarProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const sizes = sizeMap[size];

    return (
        <div className={cn("relative shrink-0", className)}>
            <div
                className={cn(
                    "rounded-full overflow-hidden bg-primary/20 flex items-center justify-center",
                    sizes.container
                )}
            >
                {src ? (
                    <Image
                        src={src}
                        alt={name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className={cn("font-medium text-primary", sizes.text)}>
                        {initials}
                    </span>
                )}
            </div>
            {isOnline !== undefined && (
                <span
                    className={cn(
                        "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                        isOnline ? "bg-[var(--online-green)]" : "bg-muted-foreground"
                    )}
                />
            )}
        </div>
    );
}
