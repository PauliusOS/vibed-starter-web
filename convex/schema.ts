import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  todos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("completed")),
    userId: v.string(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Agent Directory schema
  agents: defineTable({
    name: v.string(),
    description: v.string(),
    rules: v.array(v.string()), // Array of strings for agent rules/capabilities
    category: v.string(), // e.g., "Code Generation", "Debugging", "Refactoring", "Testing", "Documentation"
    tags: v.array(v.string()), // e.g., "Python", "JavaScript", "React", "TypeScript", "Node.js"
    tools: v.array(v.string()), // Tools the agent uses e.g., "GitHub", "VS Code", "Docker"
    authorId: v.optional(v.id("users")), // Link to a user if agents are user-submitted
    isPublic: v.boolean(), // Whether the agent is publicly visible
    createdAt: v.number(),
    updatedAt: v.number(),
    views: v.optional(v.number()), // Track view count
    likes: v.optional(v.number()), // Track like count
  })
    .searchIndex("search_agents", {
      searchField: "description",
      filterFields: ["category", "authorId"],
    })
    .index("by_category", ["category"])
    .index("by_authorId", ["authorId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_likes", ["likes"]),

  // Users table for agent authors
  users: defineTable({
    clerkUserId: v.string(), // Clerk user ID
    name: v.string(),
    email: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    createdAt: v.number(),
    agentCount: v.optional(v.number()), // Number of agents created
  })
    .index("by_clerkUserId", ["clerkUserId"]),

  // Agent likes tracking
  agentLikes: defineTable({
    agentId: v.id("agents"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_agentId", ["agentId"])
    .index("by_userId", ["userId"])
    .index("by_agentId_userId", ["agentId", "userId"]),
});
