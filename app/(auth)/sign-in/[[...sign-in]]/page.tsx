import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-[oklch(0.11_0_0)]">
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
    );
}
