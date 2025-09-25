"use client";

import { useState, useCallback } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AgentCard from "@/components/agents/AgentCard";
import AgentsSidebar from "@/components/agents/AgentsSidebar";
import { Plus, Loader2, Database } from "lucide-react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";

export default function AgentsPage() {
  const { isSignedIn } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sortBy] = useState<"newest" | "popular" | "views">("newest");

  // Get categories for filter
  const categories = useQuery(api.agents.getCategories) || [];

  // Get agents based on selected category
  const { results, status, loadMore } = usePaginatedQuery(
    api.agents.listAgents,
    { category: selectedCategory, sortBy },
    { initialNumItems: 12 }
  );

  const handleCategoryChange = useCallback((category: string | undefined) => {
    setSelectedCategory(category);
  }, []);

  const isLoading = status === "LoadingFirstPage";

  return (
    <div className="min-h-screen bg-black">
      {/* Top Bar */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-sm font-logo font-medium text-white uppercase tracking-wider hover:text-gray-300">
              CODE AGENTS
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link
                href="/agents"
                className="text-sm text-white hover:text-gray-300 transition-colors uppercase tracking-wider border-b-2 border-white"
              >
                Agents
              </Link>
              <Link
                href="/mcp"
                className="text-sm text-white hover:text-gray-300 transition-colors uppercase tracking-wider"
              >
                MCP
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-white hover:text-gray-300 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Category Sidebar */}
        <AgentsSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {selectedCategory ? `${selectedCategory} Agents` : "All Agents"}
            </h1>
            <p className="text-gray-400">
              {selectedCategory
                ? `Browse agents specialized in ${selectedCategory.toLowerCase()} development`
                : "Browse all available AI coding agents"
              }
            </p>
          </div>

          {/* Add Agent Button */}
          {isSignedIn && (
            <div className="flex justify-end mb-6">
              <Link
                href="/agents/new"
                className="inline-flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Link>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
              <p className="text-gray-400">Loading agents...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Database className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {selectedCategory ? `No ${selectedCategory.toLowerCase()} agents found` : "No agents yet"}
              </h3>
              <p className="text-gray-400 text-center max-w-md">
                {selectedCategory
                  ? `No agents available for ${selectedCategory.toLowerCase()} category yet. Be the first to add one!`
                  : isSignedIn
                  ? "Be the first to add an AI coding agent to the directory!"
                  : "Sign in to add your own AI coding agents to the directory."}
              </p>
              {isSignedIn && (
                <Link
                  href="/agents/new"
                  className="mt-6 inline-flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {selectedCategory ? `Add ${selectedCategory} Agent` : "Add First Agent"}
                </Link>
              )}
            </div>
          )}

          {/* Agent Grid */}
          {!isLoading && results.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {results.map((agent) => (
                  <AgentCard
                    key={agent._id}
                    agent={agent}
                    author={null}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {status === "CanLoadMore" && (
                <div className="flex justify-center">
                  <button
                    onClick={() => loadMore(12)}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}

              {status === "LoadingMore" && (
                <div className="flex justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}