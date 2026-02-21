"use client";

import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const clerkAppearance = {
    variables: {
        colorBackground: "#161616",
        colorText: "#ffffff",
        colorTextSecondary: "#888888",
        colorInputBackground: "#1f1f1f",
        colorInputText: "#ffffff",
        colorPrimary: "#0ea5e9",
        colorNeutral: "#ffffff",
        borderRadius: "0.75rem",
    },
    elements: {
        card: {
            backgroundColor: "#161616",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        },
        navbar: { backgroundColor: "#111111" },
        navbarButton: { color: "#aaaaaa" },
        navbarButtonActive: { color: "#ffffff" },
        scrollBox: { backgroundColor: "#161616" },
        pageScrollBox: { backgroundColor: "#161616" },
        profilePage: { backgroundColor: "#161616" },
        profileSection: {
            backgroundColor: "#161616",
            borderTop: "1px solid rgba(255,255,255,0.06)",
        },
        profileSectionTitle: { color: "#ffffff" },
        profileSectionContent: { color: "#aaaaaa" },
        accordionTriggerButton: { color: "#aaaaaa" },
        formFieldInput: {
            backgroundColor: "#1f1f1f",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#ffffff",
        },
        formButtonPrimary: {
            backgroundColor: "#0ea5e9",
            color: "#ffffff",
        },
        badge: { backgroundColor: "rgba(14,165,233,0.15)", color: "#0ea5e9" },
        footer: { backgroundColor: "#161616" },
        footerAction: { backgroundColor: "#161616" },
        footerActionLink: { color: "#0ea5e9" },
        dividerLine: { backgroundColor: "rgba(255,255,255,0.08)" },
        dividerText: { color: "#555555" },
        modalContent: { backgroundColor: "#161616" },
        modalCloseButton: { color: "#aaaaaa" },
    },
};

export function ConvexClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider appearance={clerkAppearance}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}

