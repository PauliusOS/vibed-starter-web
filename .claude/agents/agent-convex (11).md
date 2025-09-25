---
name: agent-clerk-auth-with-nextjs-convex
description: Best practices for Clerk authentication in Next.js + Convex with middleware protection, server components, and real-time sync
model: inherit
color: blue
---

# Agent: Clerk Authentication for Next.js + Convex

Best practices for implementing Clerk authentication in Next.js applications with Convex backend. Covers middleware protection, server/client components, OAuth integration, and real-time data synchronization.

## =4 CRITICAL: ClerkProvider Wrapper Order

### Issue: Provider Nesting and Hydration Errors
Incorrect provider ordering causes hydration mismatches, authentication state loss, and Convex connection failures.

**ERROR:** Hydration errors, "useAuth must be wrapped in ClerkProvider", or Convex real-time updates not working

### Solution: Proper Provider Hierarchy

```tsx
// ❌ FAILS - Wrong provider order
<ConvexClientProvider>
  <ClerkProvider>
    <App />
  </ClerkProvider>
</ConvexClientProvider>

// ✅ WORKS - Correct provider order in app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

// ✅ ConvexClientProvider component (components/ConvexClientProvider.tsx)
"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
```

## =4 CRITICAL: Middleware Protection with createRouteMatcher

### Issue: Inadequate Route Protection
Without proper middleware configuration, protected routes can be accessed by unauthenticated users.

### Solution: Clerk Middleware with Route Matching

```typescript
// ❌ FAILS - No route protection
export default clerkMiddleware();

// ✅ WORKS - Proper middleware protection (middleware.ts)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/api/protected(.*)",
  "/server(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

## =4 CRITICAL: Environment Variable Validation

### Issue: Runtime Crashes from Missing Configuration
Missing environment variables cause cryptic runtime errors instead of helpful warnings.

### Solution: Validate Configuration Early

```typescript
// ❌ FAILS - No validation, runtime errors
"use client";
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ✅ WORKS - Validation with helpful error messages
"use client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!convexUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL. Get your Convex URL from: https://dashboard.convex.dev"
  );
}

if (!clerkKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Get your key from: https://dashboard.clerk.com"
  );
}

const convex = new ConvexReactClient(convexUrl);
```

## =3 IMPORTANT: Server Components vs Client Components

### Issue: Authentication State in RSC
Server Components require different authentication patterns than Client Components.

### Solution: Proper Component Patterns

```tsx
// ❌ FAILS - Using hooks in Server Component
// app/profile/page.tsx
import { useUser } from "@clerk/nextjs";

export default async function ProfilePage() {
  const { user } = useUser(); // ERROR: Hooks can't be used in Server Components
  return <div>{user?.firstName}</div>;
}

// ✅ WORKS - Server Component with auth()
// app/profile/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Not authenticated</div>;
  }

  const user = await currentUser();
  return <div>{user?.firstName}</div>;
}

// ✅ WORKS - Client Component with hooks
// app/profile/client-profile.tsx
"use client";

import { useUser } from "@clerk/nextjs";

export default function ClientProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return <div>{user.firstName}</div>;
}
```

## =3 IMPORTANT: Protected Page Components with Convex

### Issue: Unprotected Client Components
Client components can be accessed even when user is not authenticated.

### Solution: Use Convex Authentication Components

```tsx
// ❌ FAILS - No authentication check
"use client";

export default function DashboardPage() {
  const todos = useQuery(api.todos.list);
  return <TodoList todos={todos} />;
}

// ✅ WORKS - Protected with Convex components
"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <>
      <AuthLoading>
        <LoadingSpinner />
      </AuthLoading>
      <Authenticated>
        <AuthenticatedDashboard />
      </Authenticated>
      <Unauthenticated>
        <div className="text-center">
          <h2>Please sign in to continue</h2>
          <SignInButton mode="modal">
            <button className="btn-primary">Sign In</button>
          </SignInButton>
        </div>
      </Unauthenticated>
    </>
  );
}

function AuthenticatedDashboard() {
  const todos = useQuery(api.todos.list);
  return <TodoList todos={todos} />;
}
```

## =3 IMPORTANT: User-Scoped Convex Functions

### Issue: Data Leakage Between Users
Without proper scoping, users can access each other's data.

### Solution: Always Check User Identity

```typescript
// ❌ FAILS - No user filtering
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("todos").collect();
  },
});

// ✅ WORKS - User-scoped queries with proper indexing
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Return empty for unauthenticated users
    }

    return await ctx.db
      .query("todos")
      .withIndex("by_user", (q) =>
        q.eq("userId", identity.tokenIdentifier)
      )
      .order("desc")
      .collect();
  },
});

// ✅ WORKS - Protected mutations
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("todos", {
      ...args,
      userId: identity.tokenIdentifier,
      createdAt: Date.now(),
    });
  },
});

// Schema with proper index
export default defineSchema({
  todos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]), // Critical for performance
});
```

## =2 HELPFUL: OAuth Integration with Modal/Redirect

### Issue: OAuth Flow Completion
OAuth flows in Next.js need proper redirect handling.

### Solution: Complete OAuth Handler

```tsx
// ❌ FAILS - Incomplete OAuth handling
<SignInButton>
  <button>Sign In</button>
</SignInButton>

// ✅ WORKS - OAuth with modal (recommended)
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function AuthButtons() {
  return (
    <div className="flex gap-4">
      <SignInButton mode="modal">
        <button className="btn-primary">
          Sign In
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="btn-secondary">
          Sign Up
        </button>
      </SignUpButton>
    </div>
  );
}

// ✅ ALTERNATIVE - OAuth with redirect
<SignInButton mode="redirect" redirectUrl="/dashboard">
  <button>Sign In</button>
</SignInButton>
```

## =2 HELPFUL: User Management Components

### Issue: Inconsistent User UI
Building custom user management UI is error-prone.

### Solution: Use Clerk Components

```tsx
// ✅ User button with menu
import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-10 w-10"
          }
        }}
      />
    </header>
  );
}

// ✅ Custom sign out button
import { SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function CustomSignOut() {
  const router = useRouter();

  return (
    <SignOutButton signOutCallback={() => router.push("/")}>
      <button className="text-red-500">
        Sign Out
      </button>
    </SignOutButton>
  );
}
```

## =2 HELPFUL: Server-Side Preloading with Convex

### Pattern: Optimized Initial Load
```typescript
// app/dashboard/page.tsx - Server Component
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import DashboardClient from "./client";

export default async function DashboardPage() {
  // Preload data on server
  const preloadedTodos = await preloadQuery(api.todos.list);

  return <DashboardClient preloadedTodos={preloadedTodos} />;
}

// app/dashboard/client.tsx - Client Component
"use client";

import { usePreloadedQuery } from "convex/nextjs";
import { Preloaded } from "convex/react";

export default function DashboardClient({
  preloadedTodos
}: {
  preloadedTodos: Preloaded<typeof api.todos.list>
}) {
  // Use preloaded data with real-time updates
  const todos = usePreloadedQuery(preloadedTodos);

  return <TodoList todos={todos} />;
}
```

## =2 HELPFUL: API Route Protection

### Pattern: Protecting API Routes
```typescript
// app/api/protected/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Your protected API logic
  return NextResponse.json({ userId, data: "protected data" });
}

// With Convex HTTP actions
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Process webhook
    return new Response("Success");
  }),
});

export default http;
```

## Environment Variables

### Required Configuration

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_*****
CLERK_SECRET_KEY=sk_test_*****
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Optional Clerk URLs (defaults work for most cases)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Convex Dashboard Configuration
**CRITICAL:** Set in Convex Dashboard Environment Variables:
```
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
```

## Package Dependencies

```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.0.0",
    "convex": "^1.23.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

## Quick Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "useAuth must be wrapped in ClerkProvider" | Wrong provider order | ClerkProvider must wrap ConvexClientProvider |
| "Missing NEXT_PUBLIC_CONVEX_URL" | Environment variable not set | Add to .env.local |
| Hydration mismatch errors | Server/client auth state mismatch | Use `dynamic` prop on ClerkProvider |
| Middleware not protecting routes | Matcher configuration wrong | Check middleware.ts config matcher |
| "Invalid token" in Convex | JWT issuer domain mismatch | Set CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard |
| OAuth redirects to wrong page | Missing redirect URLs | Set NEXT_PUBLIC_CLERK_AFTER_* variables |
| User data not syncing | Missing tokenIdentifier | Use `identity.tokenIdentifier` as userId |
| Queries returning all users' data | Missing user filter | Add `.withIndex("by_user")` to queries |
| Build fails with Convex errors | Convex not available at build | Wrap preloadQuery in try-catch |

## =1 AUDIT: Implementation Health Check

### Quick Verification Commands
```bash
# 1. Check environment variables
grep -E "CLERK|CONVEX" .env.local
# Should find all required keys

# 2. Check provider setup
grep -r "ClerkProvider" app/ --include="*.tsx"
# Should be in app/layout.tsx

# 3. Check middleware configuration
grep -r "clerkMiddleware" . --include="*.ts"
# Should find middleware.ts with route protection

# 4. Check Convex auth usage
grep -r "ctx.auth.getUserIdentity" convex/ --include="*.ts"
# Should be in all queries/mutations accessing user data
```

### Authentication Flow Verification
Key points to verify:
- ClerkProvider wraps entire app in layout.tsx
- ConvexProviderWithClerk uses `useAuth` from `@clerk/nextjs`
- Middleware protects sensitive routes
- All Convex functions check `ctx.auth.getUserIdentity()`

### Common Implementation Issues
**❌ Missing middleware protection** - Routes accessible without auth
**❌ Wrong provider order** - Causes hydration errors
**❌ No user scoping in Convex** - Data leaks between users
**❌ Missing indexes** - Slow queries for user data

## =1 MAINTENANCE: Performance Optimization

### Optimizing Authentication Checks

**Server Components:**
- Use `auth()` for simple checks (fastest)
- Use `currentUser()` only when user data needed
- Cache user data in React cache() when used multiple times

**Client Components:**
- Use `useUser()` hook with proper loading states
- Leverage `<Authenticated>` components to reduce checks
- Use `isLoaded` to prevent layout shifts

### Convex Query Optimization

**Index Strategy:**
```typescript
// Always index by userId for user-scoped data
defineTable({
  // fields...
}).index("by_user", ["userId"])
  .index("by_user_status", ["userId", "status"]) // Compound indexes for filters
  .index("by_user_created", ["userId", "createdAt"]); // For sorting
```

**Query Patterns:**
```typescript
// ✅ Efficient - Uses index
.withIndex("by_user", q => q.eq("userId", identity.tokenIdentifier))

// ❌ Inefficient - Full table scan
.filter(q => q.eq(q.field("userId"), identity.tokenIdentifier))
```

### Real-time Subscription Management

**Optimize Subscriptions:**
- Use `<Authenticated>` wrapper to prevent unnecessary subscriptions
- Implement pagination for large datasets
- Use `useQuery` with proper error boundaries

## Testing Checklist

### Initial Implementation Testing
- [ ] Test sign-up flow with email verification
- [ ] Test sign-in with valid/invalid credentials
- [ ] Test OAuth providers (Google, GitHub, etc.)
- [ ] Test middleware protection on protected routes
- [ ] Test redirect after sign-in/sign-up
- [ ] Test sign-out and session cleanup
- [ ] Verify environment variables are loaded
- [ ] Test Server Component authentication
- [ ] Test Client Component authentication
- [ ] Verify Convex queries are user-scoped
- [ ] Test real-time updates for authenticated users
- [ ] Check build process succeeds
- [ ] Test production deployment

### Ongoing Health Testing
- [ ] Monitor authentication success rates
- [ ] Check Convex function performance
- [ ] Verify user data isolation
- [ ] Test JWT token refresh
- [ ] Monitor real-time connection stability
- [ ] Check for hydration errors in logs
- [ ] Verify middleware performance impact
- [ ] Test rate limiting behavior