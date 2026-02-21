"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, UserPlus } from "lucide-react";

export default function HomePage() {
    const router = useRouter();

    return (
        <div className="relative hidden md:flex flex-1 flex-col items-center justify-center gap-6 text-center p-8 overflow-hidden">
            {/* Dot grid background */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle, oklch(0.35 0 0 / 0.5) 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                }}
            />

            {/* Floating shapes */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 h-3 w-3 rounded-full border border-white/10 opacity-40" />
                <div className="absolute top-1/3 right-1/3 h-2 w-2 rounded-full bg-white/5" />
                <div className="absolute bottom-1/3 left-1/3 h-4 w-4 rounded-sm border border-white/5 rotate-45 opacity-30" />
                <div className="absolute top-2/3 right-1/4 h-6 w-6 rounded-full border border-primary/10 opacity-50" />
                <div className="absolute bottom-1/4 left-1/5 h-2 w-2 bg-primary/10 rounded-full" />
            </div>

            {/* Mascot image */}
            <div className="relative animate-bounce-slow drop-shadow-2xl">
                <Image
                    src="/mascot.png"
                    alt="Kliq mascot – two speech bubbles high-fiving"
                    width={220}
                    height={220}
                    priority
                    className="select-none"
                />
            </div>

            {/* Text content */}
            <div className="relative flex flex-col items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">
                    Your kliq is waiting!
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    Select a conversation or start a new one to join the fun!
                </p>
            </div>

            {/* CTA Buttons */}
            <div className="relative flex items-center gap-3">
                <Button
                    onClick={() => {
                        // Trigger sidebar new chat — dispatch custom event
                        window.dispatchEvent(new CustomEvent("kliq:newChat"));
                    }}
                    className="gap-2 bg-primary hover:bg-primary/90 btn-primary-glow"
                >
                    <MessageSquarePlus className="h-4 w-4" />
                    Start a New Chat
                </Button>
                <Button
                    variant="outline"
                    className="gap-2 border-white/20 hover:bg-white/5 hover:border-white/30"
                >
                    <UserPlus className="h-4 w-4" />
                    Invite Friends
                </Button>
            </div>

            {/* Encrypted notice */}
            <p className="relative flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>🔒</span>
                Your messages are end-to-end encrypted
            </p>
        </div>
    );
}
