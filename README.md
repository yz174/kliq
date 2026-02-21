# Kliq

A real-time chat application built with Next.js, Convex, and Clerk. Kliq supports direct messages, group conversations, emoji reactions, typing indicators, and online presence — all with a sleek dark UI and smooth mobile-responsive layout.

---

## Features

- **Authentication** — Sign up / sign in via Clerk (email + OAuth)
- **Direct Messages** — Start a DM with any user; get-or-create semantics prevent duplicate conversations
- **Group Chats** — Create groups with multiple members and a custom name
- **Add / Remove Members** — Any group member can invite others or leave the group
- **System Stamps** — Inline event messages when someone joins or leaves a group
- **Real-time Messaging** — Powered by Convex subscriptions; no polling
- **Emoji Reactions** — React to any message with emoji; toggle on/off
- **Emoji Picker** — Insert emoji at cursor position in the message input
- **Typing Indicators** — See who is currently typing in real time
- **Online Presence** — Green dot shows which users are currently active
- **Message Deletion** — Soft-delete your own messages
- **Unread Counts** — Badge on each conversation showing unread messages
- **Info Panel** — Slide-in sheet showing DM partner details or group member list
- **Mobile Responsive** — Full-width sidebar on mobile with smooth slide animation when opening a chat
- **Dark Theme** — Consistent dark theme across the app and all Clerk modals

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Backend / Realtime | [Convex](https://convex.dev) |
| Authentication | [Clerk](https://clerk.com) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| UI Components | [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Emoji Picker | [emoji-picker-react](https://github.com/ealush/emoji-picker-react) |
| Toasts | [Sonner](https://sonner.emilkowal.ski) |
| Date Formatting | [date-fns](https://date-fns.org) |

---

## Folder Structure

```
kliq/
+-- app/                              # Next.js App Router
|   +-- globals.css                   # Global styles, CSS variables, animations
|   +-- layout.tsx                    # Root HTML layout
|   +-- (auth)/                       # Auth route group (no sidebar)
|   |   +-- sign-in/[[...sign-in]]/page.tsx
|   |   +-- sign-up/[[...sign-up]]/page.tsx
|   +-- (root)/                       # Authenticated route group (with sidebar)
|       +-- layout.tsx                # Sidebar + main content, mobile slide animation
|       +-- page.tsx                  # Home / empty state
|       +-- chat/[conversationId]/page.tsx
|
+-- components/
|   +-- chat/
|   |   +-- ChatHeader.tsx            # Header with info panel, add/leave member
|   |   +-- MessageBubble.tsx         # Individual message with reactions and delete
|   |   +-- MessageInput.tsx          # Compose area with emoji picker
|   |   +-- MessageList.tsx           # Scrollable message list with system stamps
|   |   +-- TypingIndicator.tsx       # Animated typing indicator
|   +-- dialogs/
|   |   +-- NewGroupDialog.tsx        # Create group dialog
|   |   +-- UserSearchDialog.tsx      # Search users to start a DM
|   +-- shared/
|   |   +-- SkeletonLoader.tsx        # Loading skeletons
|   |   +-- UserAvatar.tsx            # Avatar with optional online indicator
|   +-- sidebar/
|   |   +-- ConversationItem.tsx      # Single conversation row
|   |   +-- Sidebar.tsx               # Sidebar with tabs, search, settings dropdown
|   +-- ui/                           # shadcn/ui primitives (button, input, dialog, etc.)
|
+-- convex/                           # Convex backend (serverless functions + schema)
|   +-- schema.ts                     # Database schema
|   +-- conversations.ts              # DM/group CRUD, markAsRead, addMember, leaveGroup
|   +-- messages.ts                   # Send, fetch, soft-delete messages
|   +-- reactions.ts                  # Toggle emoji reactions
|   +-- presence.ts                   # Online / offline tracking
|   +-- typing.ts                     # Typing indicator state
|   +-- users.ts                      # User upsert and lookup
|   +-- _generated/                   # Auto-generated Convex types (do not edit)
|
+-- hooks/
|   +-- usePresence.ts                # Subscribe to online status for users
|   +-- useTyping.ts                  # Manage typing state for current user
|   +-- useUserSync.ts                # Sync Clerk user to Convex on sign-in
|
+-- lib/
|   +-- constants.ts                  # Shared constants (reaction emoji set, etc.)
|   +-- formatDate.ts                 # Date/time formatting helpers
|   +-- utils.ts                      # Tailwind class merge utility
|
+-- providers/
|   +-- ConvexClientProvider.tsx      # Clerk + Convex providers with global dark theme
|
+-- public/                           # Static assets (logo, mascot, etc.)
+-- next.config.ts
+-- tsconfig.json
+-- package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://dashboard.convex.dev) account
- A [Clerk](https://dashboard.clerk.com) account

### 1. Clone and install

```bash
git clone https://github.com/your-username/kliq.git
cd kliq
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Convex (auto-populated by npx convex dev)
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
```

### 3. Initialize Convex

```bash
npx convex dev --once
```

This links or creates a Convex project and pushes the schema and functions.

### 4. Run the dev server

```bash
npm run dev
```

Starts the Next.js dev server and Convex watcher concurrently. Open http://localhost:3000.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js + Convex dev servers concurrently |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

### Convex

```bash
npx convex deploy
```

### Next.js

Deploy to [Vercel](https://vercel.com) (recommended) or any Node-compatible host. Add all `.env.local` variables to your hosting environment.