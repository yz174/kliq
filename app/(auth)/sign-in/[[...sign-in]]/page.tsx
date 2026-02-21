import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import DotGrid from "@/components/DotGrid";

export default function SignInPage() {
    return (
        <div className="relative h-screen w-full bg-[oklch(0.11_0_0)] overflow-hidden">
            {/* Animated dot grid background — wrapped so it never competes in flex layout */}
            <div className="absolute inset-0 z-0">
                <DotGrid
                    dotSize={4}
                    gap={28}
                    baseColor="#1e1e2e"
                    activeColor="#0ea5e9"
                    proximity={180}
                    shockRadius={220}
                    shockStrength={4}
                    resistance={800}
                    returnDuration={1.2}
                    className="w-full h-full"
                />
            </div>

            {/* Sign-in card — centred over the grid */}
            <div className="relative z-10 flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <Image
                        src="/logo.png"
                        alt="Kliq"
                        width={80}
                        height={32}
                        priority
                        className="select-none object-contain mix-blend-screen"
                    />
                <SignIn
                    appearance={{
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
                            footer: {
                                backgroundColor: "#161616",
                                borderTop: "1px solid rgba(255,255,255,0.06)",
                            },
                            footerAction: { backgroundColor: "#161616" },
                            footerPages: { backgroundColor: "#161616" },
                            footerActionLink: { color: "#0ea5e9" },
                            headerTitle: { color: "#ffffff" },
                            headerSubtitle: { color: "#888888" },
                            dividerLine: { backgroundColor: "rgba(255,255,255,0.08)" },
                            dividerText: { color: "#555555" },
                            formFieldLabel: { color: "#aaaaaa" },
                            formFieldInput: {
                                backgroundColor: "#1f1f1f",
                                border: "1px solid rgba(255,255,255,0.10)",
                                color: "#ffffff",
                            },
                            formButtonPrimary: {
                                backgroundColor: "#0ea5e9",
                                color: "#ffffff",
                            },
                            socialButtonsBlockButton: {
                                backgroundColor: "#1f1f1f",
                                border: "1px solid rgba(255,255,255,0.10)",
                                color: "#ffffff",
                            },
                            badge: { backgroundColor: "rgba(14,165,233,0.15)", color: "#0ea5e9" },
                        },
                    }}
                />
                </div>
            </div>
        </div>
    );
}
