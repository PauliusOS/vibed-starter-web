import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get current user profile
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (idx) =>
        idx.eq("clerkUserId", identity.subject)
      )
      .unique();

    return user;
  },
});

// Query to get user profile by ID
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

// Mutation to create or update user profile
export const createOrUpdateUser = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (idx) =>
        idx.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        ...(args.name !== undefined && { name: args.name }),
        ...(args.bio !== undefined && { bio: args.bio }),
        // Update from Clerk identity if available
        email: identity.email || existingUser.email,
        profileImageUrl: identity.pictureUrl || existingUser.profileImageUrl,
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkUserId: identity.subject,
        name: args.name || identity.name || "Anonymous",
        email: identity.email || undefined,
        profileImageUrl: identity.pictureUrl || undefined,
        bio: args.bio || undefined,
        createdAt: Date.now(),
        agentCount: 0,
      });
      return userId;
    }
  },
});

// Query to get user stats
export const getUserStats = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let userId = args.userId;

    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (idx) =>
          idx.eq("clerkUserId", identity.subject)
        )
        .unique();

      if (!user) {
        return null;
      }
      userId = user._id;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Get agent count
    const agents = await ctx.db
      .query("agents")
      .withIndex("by_authorId", (idx) =>
        idx.eq("authorId", userId)
      )
      .collect();

    // Calculate total views and likes
    let totalViews = 0;
    let totalLikes = 0;

    for (const agent of agents) {
      totalViews += agent.views || 0;
      totalLikes += agent.likes || 0;
    }

    return {
      agentCount: agents.length,
      totalViews,
      totalLikes,
      joinedAt: user.createdAt,
    };
  },
});