import Image from "next/image";

export default function Loading() {
    return (
        <div className="flex h-screen items-center justify-center bg-[var(--chat-bg)]">
            <Image
                src="/logo.png"
                alt="Kliq"
                width={72}
                height={72}
                className="animate-bounce rounded-2xl"
                priority
            />
        </div>
    );
}
