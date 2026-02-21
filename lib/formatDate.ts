import { format, isToday, isThisYear } from "date-fns";

export function formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return format(date, "h:mm a");
    } else if (isThisYear(date)) {
        return format(date, "MMM d, h:mm a");
    } else {
        return format(date, "MMM d yyyy, h:mm a");
    }
}

export function formatConversationTime(timestamp: number): string {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return format(date, "h:mm a");
    } else if (isThisYear(date)) {
        return format(date, "MMM d");
    } else {
        return format(date, "MM/dd/yy");
    }
}

export function shouldShowDateDivider(
    currentMsg: { createdAt: number },
    prevMsg: { createdAt: number } | null
): boolean {
    if (!prevMsg) return true;
    const curr = new Date(currentMsg.createdAt);
    const prev = new Date(prevMsg.createdAt);
    return curr.toDateString() !== prev.toDateString();
}

export function formatDateDivider(timestamp: number): string {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isThisYear(date)) return format(date, "MMMM d");
    return format(date, "MMMM d, yyyy");
}
