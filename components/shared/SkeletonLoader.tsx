export function SkeletonMessage() {
    return (
        <div className="flex flex-col gap-4 p-4">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
                >
                    <div className="h-9 w-9 shrink-0 rounded-full bg-muted animate-pulse" />
                    <div className="flex flex-col gap-1.5 max-w-[60%]">
                        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                        <div
                            className="h-12 rounded-2xl bg-muted animate-pulse"
                            style={{ width: `${Math.random() * 40 + 60}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonSidebar() {
    return (
        <div className="flex flex-col gap-1 p-2">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-muted animate-pulse" />
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-3 w-28 rounded bg-muted animate-pulse" />
                        <div className="h-3 w-40 rounded bg-muted animate-pulse opacity-60" />
                    </div>
                </div>
            ))}
        </div>
    );
}
