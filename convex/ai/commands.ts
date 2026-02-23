//Detects AI slash-commands typed by users at the start of a message.
 
export type AICommand = "summary" | "actions" | "reply";

export function detectAICommand(text: string): AICommand | null {
  const trimmed = text.trim();
  if (trimmed.startsWith("/summarize")) return "summary";
  if (trimmed.startsWith("/action-items")) return "actions";
  if (trimmed.startsWith("/reply")) return "reply";
  return null;
}
