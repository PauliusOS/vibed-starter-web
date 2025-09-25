---
name: agent-convex-agent-directory
description: Implements an Agent Directory using Convex Native Database & Search API
model: inherit
color: purple
tech_stack:
  framework: Next.js
  database: convex
  auth: convex
  provider: convex
generated: 2025-09-24T22:47:00Z
documentation_sources:
  - https://docs.convex.dev
  - https://docs.convex.dev/search
  - https://docs.convex.dev/text-search
  - https://stack.convex.dev/authentication-best-practices-convex-clerk-nextjs
  - https://docs.convex.dev/auth
  - https://docs.convex.dev/quickstarts/nextjs
  - https://www.convex.dev/pricing
---

# Agent: Agent Directory Implementation with Convex

## Agent Overview
**Purpose**: To enable users to browse a comprehensive, searchable list of AI coding agents, displaying their functionalities and details, with real-time updates and secure authentication.
**Tech Stack**: Next.js (App Router), Convex (Database, Full Text Search, Vector Search, Actions, Mutations, Queries), Convex Auth (for authentication).
**Source**: This guide synthesizes information from official Convex documentation, community articles, and best practices.

## Critical Implementation Knowledge
### 1. Convex Latest Updates 🚨
*   **Full Text Search (FTS) Fuzzy Matching Deprecation**: As of January 15, 2025, fuzzy search matches in Convex Full Text Search are deprecated. Implementations should rely on exact keyword/phrase matching and prefix search capabilities.
*   **Convex Auth Beta**: The native Convex Auth library is currently in beta. While it offers a quick way to get authentication running, be aware that it may undergo backward-incompatible changes. For more comprehensive and stable auth features, third-party providers like Clerk are recommended.
*   **API Generation & Type Safety**: Convex automatically generates APIs and types based on your backend functions, streamlining development and ensuring type safety between frontend and backend.

### 2. Common Pitfalls & Solutions 🚨
*   **Pitfall**: Race conditions with client-side authentication leading to unauthenticated queries. If `useConvexAuth()` is not properly awaited or checked, Convex queries might execute before the user's session is fully validated, potentially exposing data or causing errors.
    *   **Solution**: Always ensure that client-side Convex queries are conditionally rendered or executed only after authentication state is confirmed. Utilize hooks like `useConvexAuth().isAuthenticated` or `useConvexAuth().isLoading` to guard data fetching. For server components, ensure middleware enforces authentication before fetching sensitive data.
*   **Pitfall**: Not defining search indexes correctly or attempting to search fields without an index.
    *   **Solution**: Ensure your Convex schema explicitly defines `searchIndex` for the fields you intend to search (e.g., agent `description`, `name`). For multi-field search, consider combining relevant fields into a single search field in your schema or defining multiple indexes.
*   **Pitfall**: Over-fetching or under-fetching data in queries, especially with large datasets like an agent directory.
    *   **Solution**: Implement pagination for listing agents to improve performance and user experience. Convex provides `paginationOptsValidator` to easily add pagination to your queries.

### 3. Best Practices 🚨
*   **Reactive Data**: Leverage Convex's real-time reactivity for the Agent Directory. When new agents are added, updated, or deleted, or when search results change, the UI will automatically reflect these changes without manual refreshes.
*   **Schema Definition**: Clearly define your agent schema in `convex/schema.ts` to ensure data consistency and enable efficient queries and search indexes. Include fields for agent name, description, capabilities, tools, and any other relevant attributes.
*   **Modular Backend Functions**: Organize your Convex backend functions (`queries`, `mutations`, `actions`) logically within the `convex/` directory using file-based routing. For example, `convex/agents.ts` for agent-related operations.
*   **Security (Authentication & Authorization)**:
    *   Perform authentication checks within your Convex functions (queries, mutations, actions) using `ctx.auth` to ensure that only authorized users can access or modify agent data.
    *   Use `internal` functions (`internalQuery`, `internalMutation`, `internalAction`) for sensitive backend logic that should not be directly exposed to the client.
*   **Error Handling**: Implement robust error handling in both Convex functions and frontend components for a better user experience and easier debugging.
*   **External Integrations**: Use Convex Actions for all external API calls (e.g., if integrating with an external LLM for agent generation, or a different vector database). This keeps complex logic off the client and within a controlled server environment.

## Implementation Steps

### Backend Implementation
The backend for the Agent Directory will primarily consist of Convex queries for reading and searching agent data, and mutations for creating, updating, and deleting agent records. Actions will be used for any complex logic or external API calls.

1.  **Define Agent Schema**: Create `agents` table with fields like `name`, `description`, `capabilities` (array of strings), `tools` (array of strings), `authorId` (for authentication/ownership), etc. Define a `searchIndex` on `name` and `description` fields.
2.  **Agent Data Mutations**: Create Convex mutations to `addAgent`, `updateAgent`, and `deleteAgent` functions.
3.  **Agent Data Queries**: Implement Convex queries to `listAgents` (with pagination), `getAgentById`, and `searchAgents` (using the defined `searchIndex`).
4.  **Authentication Integration**: Configure Convex Auth or a third-party provider (e.g., Clerk) and integrate `ctx.auth` checks into relevant queries and mutations.

### Frontend Integration
1.  **Convex Client Provider**: Set up `ConvexClientProvider` (or `ConvexProviderWithClerk`) in your `app/layout.tsx` to make Convex available throughout your Next.js application.
2.  **Agent Listing Component**: Create a React component to display a paginated list of agents, fetching data using `useQuery(api.agents.listAgents)`.
3.  **Search Input & Results**: Develop a search input component that triggers `useQuery(api.agents.searchAgents, { query: searchInput })` to display real-time search results.
4.  **Agent Detail Page**: Implement a dynamic route for individual agent pages, fetching agent details using `useQuery(api.agents.getAgentById, { id: agentId })`.
5.  **Agent Management Forms**: Create forms for adding, editing, or deleting agents, calling the respective Convex mutations.
6.  **Authentication UI**: Integrate UI components for sign-in/sign-up/sign-out using Convex Auth hooks (e.g., `useSignIn`, `useSignUp`) or Clerk components.

## Code Patterns

### Convex Backend Functions
*   **`convex/schema.ts`**: Define the database schema, including the `agents` table and its search index.
    ```typescript
    import { defineSchema, defineTable } from "convex/server";
    import { v } from "convex/values";

    export default defineSchema({
      agents: defineTable({
        name: v.string(),
        description: v.string(),
        capabilities: v.array(v.string()),
        tools: v.array(v.string()),
        authorId: v.id("users"), // Reference to a users table
      }).searchIndex("by_name_and_description", {
        searchField: "description",
        filterFields: ["authorId"], // Example: to filter searches by agent author
      }).vectorIndex("by_description_embedding", { // Example for Vector Search
        vectorField: "descriptionEmbedding",
        filterFields: ["authorId"],
        dimensions: 1536, // Example: for OpenAI embeddings
      }),
      users: defineTable({
        // ... user fields
      }),
    });
    ```
*   **`convex/agents.ts`**: Contains functions for interacting with `agents` table.

    *   **Query for Listing Agents (with pagination)**:
        ```typescript
        import { query } from "./_generated/server";
        import { paginationOptsValidator } from "convex/server";
        import { v } from "convex/values";

        export const listAgents = query({
          args: {
            paginationOpts: paginationOptsValidator,
            authorId: v.optional(v.id("users")), // Optional filter
          },
          handler: async (ctx, args) => {
            // Add auth check here if needed
            let q = ctx.db.query("agents");
            if (args.authorId) {
              q = q.filter((f) => f.eq(f.field("authorId"), args.authorId));
            }
            return await q.order("desc").paginate(args.paginationOpts);
          },
        });
        ```

    *   **Query for Searching Agents (Full Text Search)**:
        ```typescript
        import { query } from "./_generated/server";
        import { v } from "convex/values";
        import { paginationOptsValidator } from "convex/server";

        export const searchAgents = query({
          args: {
            searchQuery: v.string(),
            paginationOpts: paginationOptsValidator,
          },
          handler: async (ctx, args) => {
            // Optional: Add auth check here if agents are private
            if (args.searchQuery.length === 0) {
              return { page: [], isDone: true, continueCursor: null };
            }

            return await ctx.db
              .query("agents")
              .withSearchIndex("by_name_and_description", (q) =>
                q.search("description", args.searchQuery) // Search only on description
              )
              .paginate(args.paginationOpts);
          },
        });
        ```

    *   **Mutation for Adding an Agent (with auth)**:
        ```typescript
        import { mutation } from "./_generated/server";
        import { v } from "convex/values";

        export const addAgent = mutation({
          args: {
            name: v.string(),
            description: v.string(),
            capabilities: v.array(v.string()),
            tools: v.array(v.string()),
          },
          handler: async (ctx, args) => {
            const identity = await ctx.auth.getUserIdentity();
            if (!identity) {
              throw new Error("Not authenticated");
            }

            // Assuming a 'users' table exists and userId matches identity.subject
            const user = await ctx.db
              .query("users")
              .withIndex("by_token_identifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
              )
              .unique();

            if (!user) {
              throw new Error("User not found");
            }

            const agentId = await ctx.db.insert("agents", {
              name: args.name,
              description: args.description,
              capabilities: args.capabilities,
              tools: args.tools,
              authorId: user._id,
              // Potentially generate embedding here with an Action
              // descriptionEmbedding: await ctx.runAction(api.llm.generateEmbedding, { text: args.description })
            });
            return agentId;
          },
        });
        ```
*   **`convex/llm.ts` (Example Action for External API Integration - optional)**:
    ```typescript
    import { action } from "./_generated/server";
    import { v } from "convex/values";

    export const generateEmbedding = action({
      args: { text: v.string() },
      handler: async (ctx, args) => {
        // Example: Call an external LLM API to generate embeddings
        const response = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            input: args.text,
            model: "text-embedding-ada-002",
          }),
        });
        const data = await response.json();
        return data.data[0].embedding;
      },
    });
    ```
    *Note*: If using Convex's native Vector Search, embedding generation might be handled differently (e.g., through a mutation hook or directly within a mutation after an `insert`/`patch`).

## Testing & Debugging
*   **Convex Dashboard**: Use the Convex Dashboard (`dashboard.convex.dev`) to inspect database tables, query/mutation/action logs, and monitor function executions. This is crucial for verifying data integrity and debugging backend logic.
*   **Convex CLI (`npx convex dev`)**: Run `npx convex dev` in development mode to automatically sync your backend code with your Convex deployment and receive real-time error feedback in your terminal.
*   **Unit & Integration Tests**: Write unit tests for your Convex queries, mutations, and actions using Convex's testing utilities.
*   **Frontend Console Logs**: Use browser developer tools to check network requests to Convex, observe data returned by `useQuery` hooks, and debug component rendering.
*   **Authentication Flow Testing**: Thoroughly test user sign-up, sign-in, and sign-out flows with different user states (authenticated, unauthenticated, unauthorized) to ensure security and prevent race conditions.
*   **Search Relevance**: Test search queries with various inputs to ensure the `searchIndex` is returning relevant results as expected. Adjust `searchField` and `filterFields` as needed in your schema definition.

## Environment Variables
*   `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL (generated by `npx convex dev` or found in the dashboard).
*   `NEXT_PUBLIC_CONVEX_SITE_URL`: Your Convex site URL, used for auth redirects.
*   `CONVEX_AUTH_SECRET` (if using Convex Auth): A secret key for cryptographic operations. Can be generated with `npx convex env set CONVEX_AUTH_SECRET=$(openssl rand -base64 32)`.
*   `CLERK_SECRET_KEY` (if using Clerk): Your Clerk backend secret key.
*   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (if using Clerk): Your Clerk frontend publishable key.
*   `OPENAI_API_KEY` (if using OpenAI for embeddings/LLM via Actions): Your OpenAI API key.

## Success Metrics
*   **Agent Data Persistence**: New agents are successfully added to the Convex database and can be retrieved.
*   **Real-time Updates**: Changes to agent data in the backend (via dashboard or mutations) are immediately reflected in the frontend Agent Directory.
*   **Effective Search**: Users can find relevant agents using the search bar, with results powered by Convex's Full Text Search API. (And Vector Search if implemented for semantic relevance).
*   **Secure Access**: Only authenticated and authorized users can add, edit, or delete agent information. Unauthorized attempts are blocked.
*   **Performance**: Agent listings and search results load quickly, even with a growing number of agents, indicating efficient use of queries and pagination.
*   **No Race Conditions**: The application handles authentication state gracefully, ensuring Convex queries are never run with an unvalidated user session.