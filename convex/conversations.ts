import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create a DM conversation between two users
export const getOrCreateDM = mutation({
    args: {
        currentUserId: v.id("users"),
        otherUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Find existing DM between the two users
        const myMemberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", args.currentUserId))
            .collect();

        for (const membership of myMemberships) {
            const conv = await ctx.db.get(membership.conversationId);
            if (!conv || conv.type !== "dm") continue;

            const members = await ctx.db
                .query("conversationMembers")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", membership.conversationId)
                )
                .collect();

            const otherMember = members.find(
                (m) => m.userId === args.otherUserId
            );
            if (otherMember) {
                return membership.conversationId;
            }
        }

        // Create new DM
        const conversationId = await ctx.db.insert("conversations", {
            type: "dm",
            createdBy: args.currentUserId,
        });

        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: args.currentUserId,
        });
        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: args.otherUserId,
        });

        return conversationId;
    },
});

// Create a group conversation
export const createGroup = mutation({
    args: {
        name: v.string(),
        memberIds: v.array(v.id("users")),
        createdBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        const conversationId = await ctx.db.insert("conversations", {
            type: "group",
            name: args.name,
            createdBy: args.createdBy,
        });

        const allMembers = [args.createdBy, ...args.memberIds.filter(
            (id) => id !== args.createdBy
        )];

        for (const userId of allMembers) {
            await ctx.db.insert("conversationMembers", {
                conversationId,
                userId,
            });
        }

        return conversationId;
    },
});

// Get all conversations for a user with metadata
export const getUserConversations = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const memberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();

        const conversations = await Promise.all(
            memberships.map(async (membership) => {
                const conversation = await ctx.db.get(membership.conversationId);
                if (!conversation) return null;

                // Get all members
                const members = await ctx.db
                    .query("conversationMembers")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", membership.conversationId)
                    )
                    .collect();

                const memberUsers = await Promise.all(
                    members.map((m) => ctx.db.get(m.userId))
                );

                // Get last message
                const lastMessage = conversation.lastMessageId
                    ? await ctx.db.get(conversation.lastMessageId)
                    : null;

                // Count unread messages
                const lastReadId = membership.lastReadMessageId;
                let unreadCount = 0;

                if (lastReadId) {
                    const lastReadMsg = await ctx.db.get(lastReadId);
                    if (lastReadMsg) {
                        const unreadMessages = await ctx.db
                            .query("messages")
                            .withIndex("by_conversationId_createdAt", (q) =>
                                q
                                    .eq("conversationId", membership.conversationId)
                                    .gt("createdAt", lastReadMsg.createdAt)
                            )
                            .filter((q) => q.neq(q.field("senderId"), args.userId))
                            .collect();
                        unreadCount = unreadMessages.length;
                    }
                } else {
                    // All messages from others are unread
                    const allMessages = await ctx.db
                        .query("messages")
                        .withIndex("by_conversationId", (q) =>
                            q.eq("conversationId", membership.conversationId)
                        )
                        .filter((q) => q.neq(q.field("senderId"), args.userId))
                        .collect();
                    unreadCount = allMessages.length;
                }

                return {
                    ...conversation,
                    members: memberUsers.filter(Boolean),
                    lastMessage,
                    unreadCount,
                    myMembershipId: membership._id,
                    lastReadMessageId: membership.lastReadMessageId,
                };
            })
        );

        return conversations
            .filter(Boolean)
            .sort(
                (a, b) =>
                    (b!.lastMessageTime ?? b!._creationTime) -
                    (a!.lastMessageTime ?? a!._creationTime)
            );
    },
});

// Get conversation by ID with member details
export const getConversationById = query({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return null;

        const members = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const memberUsers = await Promise.all(
            members.map((m) => ctx.db.get(m.userId))
        );

        const myMembership = members.find((m) => m.userId === args.userId);

        return {
            ...conversation,
            members: memberUsers.filter(Boolean),
            myMembership,
        };
    },
});

// Add a member to a group conversation
export const addGroupMember = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        addedByUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation || conversation.type !== "group") {
            throw new Error("Not a group conversation");
        }

        const existing = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_userId", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", args.userId)
            )
            .unique();

        if (existing) throw new Error("User is already a member");

        await ctx.db.insert("conversationMembers", {
            conversationId: args.conversationId,
            userId: args.userId,
        });

        // System stamp
        const addedBy = await ctx.db.get(args.addedByUserId);
        const added = await ctx.db.get(args.userId);
        const now = Date.now();
        const msgId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: args.addedByUserId,
            content: `${addedBy?.name ?? "Someone"} added ${added?.name ?? "someone"} to the group`,
            isDeleted: false,
            type: "system",
            createdAt: now,
        });
        await ctx.db.patch(args.conversationId, { lastMessageId: msgId, lastMessageTime: now });
    },
});

// Leave a group conversation
export const leaveGroup = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_userId", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", args.userId)
            )
            .unique();

        if (!membership) throw new Error("Not a member of this group");

        // System stamp before deleting membership
        const leavingUser = await ctx.db.get(args.userId);
        const now = Date.now();
        const msgId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: args.userId,
            content: `${leavingUser?.name ?? "Someone"} left the group`,
            isDeleted: false,
            type: "system",
            createdAt: now,
        });
        await ctx.db.patch(args.conversationId, { lastMessageId: msgId, lastMessageTime: now });

        await ctx.db.delete(membership._id);

        // If no members remain, delete the conversation and its messages
        const remaining = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        if (remaining.length === 0) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", args.conversationId)
                )
                .collect();
            for (const msg of messages) {
                await ctx.db.delete(msg._id);
            }
            await ctx.db.delete(args.conversationId);
        }
    },
});

// Mark conversation as read
export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastMessageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_userId", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", args.userId)
            )
            .unique();

        if (membership) {
            await ctx.db.patch(membership._id, {
                lastReadMessageId: args.lastMessageId,
            });
        }
    },
});
