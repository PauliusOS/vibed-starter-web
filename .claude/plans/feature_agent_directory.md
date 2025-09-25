# Roadmap: Agent Directory

## Context
- Stack: Next.js, convex, convex
- Feature: Agent Directory with Convex Native Database & Search
- Goal: Enable browsing of AI coding agents, including their rules and functionalities, with search capabilities.
- User Experience: Users should be able to quickly find agents by keywords, view their details, and potentially filter them. The experience should be real-time and responsive.

## Implementation Steps

### 1. Manual Setup (User Required)
- [ ] Create Convex account and project.
- [ ] Configure Convex dashboard with project settings.
- [ ] Generate Convex deploy keys (handled by `npx convex dev` and `npx convex deploy`).
- [ ] Set up a third-party authentication provider (e.g., Clerk or Auth0) account.
- [ ] Configure authentication provider dashboard (create application, set redirect URLs).
- [ ] Configure billing in Convex if exceeding free tier limits. [cite:3_4]

### 2. Dependencies & Environment
- [ ] Install: `convex`, `@clerk/nextjs` (or `@auth0/auth0-react` and `convex/react-auth0`), `@ai-sdk/openai` (or other AI SDKs as needed for future agent integrations).
- [ ] Env vars:
    - `NEXT_PUBLIC_CONVEX_URL` (from Convex dashboard/CLI)
    - `CLERK_SECRET_KEY` (from Clerk dashboard)
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from Clerk dashboard)
    - (If Auth0: `NEXT_PUBLIC_AUTH0_DOMAIN`, `NEXT_PUBLIC_AUTH0_CLIENT_ID`)

### 3. Database Schema
- [ ] Structure: Define schema for `agents` table.
    ```typescript
    // convex/schema.ts
    import { defineSchema, defineTable } from "convex/server";
    import { v } from "convex/values";

    export default defineSchema({
      agents: defineTable({
        name: v.string(),
        description: v.string(),
        rules: v.array(v.string()), // Array of strings for agent rules
        category: v.string(), // e.g., "Code Generation", "Debugging", "Refactoring"
        tags: v.array(v.string()), // e.g., "Python", "JavaScript", "React"
        authorId: v.optional(v.id("users")), // Link to a user if agents are user-submitted
        createdAt: v.number(),
      })
      .searchIndex("search_description_and_name", {
        searchField: "description",
        filterFields: ["category", "tags", "authorId"],
        // You can also add searchField: "name" in a future iteration
      })
      .index("by_category", ["category"])
      .index("by_authorId", ["authorId"]),

      // Optional: A users table for authentication if needed for agent submission
      users: defineTable({
        clerkUserId: v.string(), // Or auth0UserId, etc.
        name: v.string(),
        profileImageUrl: v.optional(v.string()),
      }).index("by_clerkUserId", ["clerkUserId"]).unique(),
    });
    ```

### 4. Backend Functions
- [ ] `agents.ts`:
    - `listAgents`: Query function to retrieve all agents, potentially with pagination and filtering by category/tags.
    - `searchAgents`: Query function utilizing `search_description_and_name` index to find agents by text query. [cite:3_1]
    - `getAgentById`: Query function to retrieve a single agent's details by ID.
    - `createAgent`: Mutation function to add a new agent (requires authentication and validation).
    - `updateAgent`: Mutation function to modify an existing agent (requires authentication and authorization).
    - `deleteAgent`: Mutation function to remove an agent (requires authentication and authorization).
- [ ] `users.ts` (if implementing user profiles):
    - `getOrCreateUser`: Mutation to create or retrieve user entry upon first login (tied to auth provider ID).
    - `getUserProfile`: Query to get a user's profile details.
- [ ] `http.ts` (if needed for webhooks from auth provider or external services):
    - `clerkWebhook`: HTTP action to handle Clerk webhooks for user data synchronization. [cite:6_2]

### 5. Frontend
- [ ] `ConvexClientProvider.tsx`: Client component to wrap the Next.js app with `ConvexProviderWithClerk` (or `ConvexProviderWithAuth0`) for client-side reactivity and authentication. [cite:2_2, 3_2, 6_2]
- [ ] `layout.tsx`: Root layout to include `ConvexClientProvider`.
- [ ] `page.tsx`:
    - Display a list of agents, potentially with infinite scroll (using paginated queries).
    - Search input field that triggers `searchAgents` query.
    - Filtering UI (e.g., dropdowns for category, tags).
- [ ] `AgentCard.tsx`: Component to display a summary of an individual agent.
- [ ] `AgentDetail.tsx`: Component to display full details of an agent.
- [ ] `AddAgentForm.tsx`: Component for submitting new agents (requires authenticated user).
- [ ] `LoadingSpinner.tsx`: For loading states.
- [ ] `ErrorDisplay.tsx`: For error states.

### 6. Error Prevention
- [ ] API errors: Implement `try/catch` blocks in frontend and backend functions for Convex operations.
- [ ] Validation: Use Convex's `v` (from `convex/values`) for schema validation and function arguments/returns. [cite:5_1]
- [ ] Rate limiting: Apply `@convex-dev/rate-limiter` to `createAgent` or `updateAgent` mutations if publicly accessible to prevent abuse. [cite:4_2]
- [ ] Auth:
    - Enforce authentication checks (`ctx.auth.getUserIdentity()`) within all sensitive Convex functions. [cite:1_3, 3_3]
    - Use `<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>` components from `convex/react` for UI state. [cite:6_2]
    - Conditionally skip Convex queries (`useQuery(api.agents.listAgents, {}, { skip: !isAuthenticated })`) until the user's authentication state is confirmed to avoid unnecessary calls or security issues. [cite:3_3]
- [ ] Type safety: Leverage TypeScript and Convex's generated API types (`_generated/api.ts`) for end-to-end type safety.
- [ ] Boundaries: Use `query` for reads, `mutation` for writes, and `action` for external API calls or complex, non-transactional logic. [cite:2_2]

### 7. Testing
- [ ] Unit tests for Convex backend functions (queries, mutations, actions).
- [ ] Integration tests for frontend components interacting with Convex.
- [ ] End-to-end tests for core user flows (browsing, searching, viewing agent details, adding/editing agent if applicable).
- [ ] Authentication flow tests (login, logout, access to protected content).
- [ ] Search functionality tests (keyword matching, filtering, edge cases).