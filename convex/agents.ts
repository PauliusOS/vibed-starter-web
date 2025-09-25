import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { Doc, Id } from "./_generated/dataModel";

// Query to list agents with pagination and filtering
export const listAgents = query({
  args: {
    paginationOpts: paginationOptsValidator,
    category: v.optional(v.string()),
    authorId: v.optional(v.id("users")),
    sortBy: v.optional(v.union(v.literal("newest"), v.literal("popular"), v.literal("views"))),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("agents").withIndex("by_createdAt");

    // Apply filters
    if (args.category) {
      q = ctx.db.query("agents").withIndex("by_category", (idx) =>
        idx.eq("category", args.category!)
      );
    } else if (args.authorId) {
      q = ctx.db.query("agents").withIndex("by_authorId", (idx) =>
        idx.eq("authorId", args.authorId!)
      );
    }

    // Apply sorting
    if (args.sortBy === "popular") {
      q = ctx.db.query("agents").withIndex("by_likes");
    }

    const result = await q.order("desc").paginate(args.paginationOpts);

    // Filter out non-public agents unless they belong to the current user
    const identity = await ctx.auth.getUserIdentity();
    let filteredPage = result.page;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (idx) =>
          idx.eq("clerkUserId", identity.subject)
        )
        .unique();

      if (user) {
        filteredPage = result.page.filter(
          agent => agent.isPublic || agent.authorId === user._id
        );
      } else {
        filteredPage = result.page.filter(agent => agent.isPublic);
      }
    } else {
      filteredPage = result.page.filter(agent => agent.isPublic);
    }

    return {
      ...result,
      page: filteredPage,
    };
  },
});

// Query to search agents using full-text search
export const searchAgents = query({
  args: {
    searchQuery: v.string(),
    paginationOpts: paginationOptsValidator,
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.searchQuery.length === 0) {
      return { page: [], isDone: true, continueCursor: null };
    }

    // Use the search index
    const results = await ctx.db
      .query("agents")
      .withSearchIndex("search_agents", (q) => {
        let search = q.search("description", args.searchQuery);
        if (args.category) {
          search = search.eq("category", args.category);
        }
        return search;
      })
      .paginate(args.paginationOpts);

    // Filter out non-public agents
    const identity = await ctx.auth.getUserIdentity();
    let filteredPage = results.page;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (idx) =>
          idx.eq("clerkUserId", identity.subject)
        )
        .unique();

      if (user) {
        filteredPage = results.page.filter(
          agent => agent.isPublic || agent.authorId === user._id
        );
      } else {
        filteredPage = results.page.filter(agent => agent.isPublic);
      }
    } else {
      filteredPage = results.page.filter(agent => agent.isPublic);
    }

    return {
      ...results,
      page: filteredPage,
    };
  },
});

// Query to get a single agent by ID
export const getAgentById = query({
  args: {
    agentId: v.id("agents")
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);

    if (!agent) {
      return null;
    }

    // Check if the agent is public or belongs to the current user
    const identity = await ctx.auth.getUserIdentity();

    if (!agent.isPublic) {
      if (!identity) {
        return null;
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (idx) =>
          idx.eq("clerkUserId", identity.subject)
        )
        .unique();

      if (!user || agent.authorId !== user._id) {
        return null;
      }
    }

    // Get author information
    let author = null;
    if (agent.authorId) {
      author = await ctx.db.get(agent.authorId);
    }

    return {
      ...agent,
      author,
    };
  },
});

// Mutation to increment view count
export const incrementViews = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (agent) {
      await ctx.db.patch(args.agentId, {
        views: (agent.views || 0) + 1,
      });
    }
  },
});

// Query to get agents by the current user
export const getMyAgents = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return { page: [], isDone: true, continueCursor: null };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (idx) =>
        idx.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (!user) {
      return { page: [], isDone: true, continueCursor: null };
    }

    return await ctx.db
      .query("agents")
      .withIndex("by_authorId", (idx) =>
        idx.eq("authorId", user._id)
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Mutation to create a new agent
export const createAgent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    rules: v.array(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    tools: v.array(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get or create user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (idx) =>
        idx.eq("clerkUserId", identity.subject)
      )
      .unique();

    let userId: Id<"users">;

    if (!existingUser) {
      // Create new user
      userId = await ctx.db.insert("users", {
        clerkUserId: identity.subject,
        name: identity.name || "Anonymous",
        email: identity.email || undefined,
        profileImageUrl: identity.pictureUrl || undefined,
        createdAt: Date.now(),
        agentCount: 1,
      });
    } else {
      userId = existingUser._id;
      // Update agent count
      await ctx.db.patch(userId, {
        agentCount: (existingUser.agentCount || 0) + 1,
      });
    }

    // Validate inputs
    if (args.name.length < 3 || args.name.length > 100) {
      throw new Error("Agent name must be between 3 and 100 characters");
    }

    if (args.description.length < 10 || args.description.length > 2000) {
      throw new Error("Agent description must be between 10 and 2000 characters");
    }

    if (args.rules.length === 0) {
      throw new Error("Agent must have at least one rule");
    }

    if (args.tags.length === 0) {
      throw new Error("Agent must have at least one tag");
    }

    // Create the agent
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      description: args.description,
      rules: args.rules,
      category: args.category,
      tags: args.tags,
      tools: args.tools,
      authorId: userId,
      isPublic: args.isPublic,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      views: 0,
      likes: 0,
    });

    return agentId;
  },
});

// Mutation to update an agent
export const updateAgent = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    rules: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    tools: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const agent = await ctx.db.get(args.agentId);

    if (!agent) {
      throw new Error("Agent not found");
    }

    // Check if the user owns this agent
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (idx) =>
        idx.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (!user || agent.authorId !== user._id) {
      throw new Error("Not authorized to update this agent");
    }

    // Validate inputs if provided
    if (args.name !== undefined && (args.name.length < 3 || args.name.length > 100)) {
      throw new Error("Agent name must be between 3 and 100 characters");
    }

    if (args.description !== undefined && (args.description.length < 10 || args.description.length > 2000)) {
      throw new Error("Agent description must be between 10 and 2000 characters");
    }

    // Update the agent
    await ctx.db.patch(args.agentId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.rules !== undefined && { rules: args.rules }),
      ...(args.category !== undefined && { category: args.category }),
      ...(args.tags !== undefined && { tags: args.tags }),
      ...(args.tools !== undefined && { tools: args.tools }),
      ...(args.isPublic !== undefined && { isPublic: args.isPublic }),
      updatedAt: Date.now(),
    });
  },
});

// Mutation to delete an agent
export const deleteAgent = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const agent = await ctx.db.get(args.agentId);

    if (!agent) {
      throw new Error("Agent not found");
    }

    // Check if the user owns this agent
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (idx) =>
        idx.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (!user || agent.authorId !== user._id) {
      throw new Error("Not authorized to delete this agent");
    }

    // Delete all likes for this agent
    const likes = await ctx.db
      .query("agentLikes")
      .withIndex("by_agentId", (idx) =>
        idx.eq("agentId", args.agentId)
      )
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Delete the agent
    await ctx.db.delete(args.agentId);

    // Update user's agent count
    await ctx.db.patch(user._id, {
      agentCount: Math.max(0, (user.agentCount || 1) - 1),
    });
  },
});

// Mutation to toggle like on an agent
export const toggleLike = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const agent = await ctx.db.get(args.agentId);

    if (!agent) {
      throw new Error("Agent not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (idx) =>
        idx.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has already liked this agent
    const existingLike = await ctx.db
      .query("agentLikes")
      .withIndex("by_agentId_userId", (idx) =>
        idx.eq("agentId", args.agentId).eq("userId", user._id)
      )
      .unique();

    if (existingLike) {
      // Unlike the agent
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.agentId, {
        likes: Math.max(0, (agent.likes || 1) - 1),
      });
      return { liked: false };
    } else {
      // Like the agent
      await ctx.db.insert("agentLikes", {
        agentId: args.agentId,
        userId: user._id,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.agentId, {
        likes: (agent.likes || 0) + 1,
      });
      return { liked: true };
    }
  },
});

// Query to check if user has liked an agent
export const hasUserLikedAgent = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (idx) =>
        idx.eq("clerkUserId", identity.subject)
      )
      .unique();

    if (!user) {
      return false;
    }

    const like = await ctx.db
      .query("agentLikes")
      .withIndex("by_agentId_userId", (idx) =>
        idx.eq("agentId", args.agentId).eq("userId", user._id)
      )
      .unique();

    return !!like;
  },
});

// Query to get available categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return [
      "Code Generation",
      "Debugging",
      "Refactoring",
      "Testing",
      "Documentation",
      "DevOps",
      "Database",
      "Security",
      "Performance",
      "UI/UX",
      "API Development",
      "Data Analysis",
      "Machine Learning",
      "Other",
    ];
  },
});

// Query to get popular tags
export const getPopularTags = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .take(100);

    const tagCounts = new Map<string, number>();

    for (const agent of agents) {
      for (const tag of agent.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag]) => tag);
  },
});