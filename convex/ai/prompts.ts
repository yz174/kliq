import type { AICommand } from "./commands";

interface MessageContext {
  senderName: string;
  content: string;
  createdAt: number;
}

function formatContext(messages: MessageContext[]): string {
  return messages
    .map((m) => {
      const time = new Date(m.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `[${time}] ${m.senderName}: ${m.content}`;
    })
    .join("\n");
}

const BASE_INSTRUCTION = `You are an AI assistant embedded in Kliq, a real-time messaging app. 
Your job is to help users stay on top of their conversations without replacing them. 
Be concise, structured, and use plain language.`;

export function buildPrompt(
  command: AICommand,
  context: MessageContext[]
): string {
  const log = formatContext(context);

  switch (command) {
    case "summary":
      return `${BASE_INSTRUCTION}

Below is the recent conversation history. Write a concise summary (3-5 sentences) that captures:
- The main topics discussed
- Any decisions made
- The overall tone

Conversation:
${log}

Summary:`;

    case "actions":
      return `${BASE_INSTRUCTION}

Below is the recent conversation history. Extract all action items, tasks, and decisions mentioned.
Format them as a numbered list. Only include concrete, actionable items — skip casual chit-chat.
If no action items exist, respond with "No action items found."

Conversation:
${log}

Action Items:`;

    case "reply":
      return `${BASE_INSTRUCTION}

Below is the recent conversation history. Suggest 3 short, natural reply options the user could send next.
Each reply should be contextually relevant, concise (1-2 sentences max), and distinct from the others.
Format: one reply per line, no numbering or bullets.

Conversation:
${log}

Suggested replies:`;
  }
}
