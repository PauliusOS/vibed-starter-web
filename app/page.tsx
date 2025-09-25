"use client";

import { useState, useCallback } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AgentCard from "@/components/agents/AgentCard";
import TechStackCard from "@/components/agents/TechStackCard";
import SearchBar from "@/components/agents/SearchBar";
import { Plus, Loader2, Database } from "lucide-react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return <HomeDashboard />;
}

function HomeDashboard() {
  const { isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "views">("newest");
  const [selectedPlatform, setSelectedPlatform] = useState<"claude" | "chatgpt">("claude");

  // Get categories for filter
  const categories = useQuery(api.agents.getCategories) || [];

  // Featured tech stacks
  const featuredTechStacks = ["NextJS", "Expo", "Stripe", "Convex", "Mapbox", "React"];

  // Mock tech stack agents for demo (you would fetch these from your API)
  const techStackAgents = featuredTechStacks.map(tech => ({
    _id: `tech-${tech.toLowerCase()}` as any,
    name: `${tech} Expert Agent`,
    description: `Specialized AI coding assistant trained on ${tech} documentation, best practices, and common patterns. Helps with setup, configuration, debugging, and advanced implementations.`,
    category: "Code Generation",
    tags: [tech.toLowerCase(), "documentation", "best-practices"],
    tools: ["*"],
    rules: [`Expert in ${tech} development`, "Follows latest best practices", "Provides working examples"],
    isPublic: true,
    views: Math.floor(Math.random() * 1000),
    likes: Math.floor(Math.random() * 100),
    authorId: "demo" as any,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));

  // Determine which query to use based on search
  const { results, status, loadMore } = usePaginatedQuery(
    searchQuery.length > 0
      ? api.agents.searchAgents
      : api.agents.listAgents,
    searchQuery.length > 0
      ? { searchQuery, category: selectedCategory }
      : { category: selectedCategory, sortBy },
    { initialNumItems: 12 }
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

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
            <h1 className="text-sm font-logo font-medium text-white uppercase tracking-wider">CODE AGENTS</h1>
          </div>
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link
                href="/agents"
                className="text-sm text-white hover:text-gray-300 transition-colors uppercase tracking-wider"
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

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Platform Selector */}
          <div className="flex justify-center gap-6 mb-8">
            <button
              onClick={() => setSelectedPlatform("claude")}
              className="transition-all"
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                selectedPlatform === "claude"
                  ? "opacity-100 scale-110"
                  : "opacity-60 hover:opacity-80"
              }`}>
                <img
                  src={`https://cdn.brandfetch.io/claude.ai/icon/theme/dark/w/512/h/512?c=${process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID}`}
                  alt="Claude"
                  className="w-12 h-12 object-contain"
                />
              </div>
            </button>
            <button
              onClick={() => setSelectedPlatform("chatgpt")}
              className="transition-all"
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                selectedPlatform === "chatgpt"
                  ? "opacity-100 scale-110"
                  : "opacity-60 hover:opacity-80"
              }`}>
                <img
                  src={`https://cdn.brandfetch.io/openai.com/icon/theme/dark/w/512/h/512?c=${process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID}`}
                  alt="ChatGPT"
                  className="w-12 h-12 object-contain"
                />
              </div>
            </button>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Join the Agent Vibe Coding community
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover and explore AI coding agents with specialized capabilities.
            Each agent is designed to help you with specific development tasks.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <SearchBar
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
            categories={categories}
          />

        </div>

        {/* Tech Stack Section */}
        {!searchQuery && (
          <div className="mb-16">
            <div className="flex justify-between items-start mb-8">
              <div className="text-left">
                <h2 className="text-2xl font-bold text-white mb-2">Code Agents</h2>
                <p className="text-gray-400">Popular agents trained your favorite stack</p>
              </div>
              <Link
                href="/agents/tech-stacks"
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {techStackAgents.map((agent, index) => (
                <TechStackCard
                  key={agent._id}
                  agent={agent}
                  techStack={featuredTechStacks[index]}
                  author={null}
                />
              ))}
            </div>
          </div>
        )}

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
              {searchQuery ? "No agents found" : "No agents yet"}
            </h3>
            <p className="text-gray-400 text-center max-w-md">
              {searchQuery
                ? "Try adjusting your search terms or filters."
                : isSignedIn
                ? "Be the first to add an AI coding agent to the directory!"
                : "Sign in to add your own AI coding agents to the directory."}
            </p>
            {!searchQuery && isSignedIn && (
              <Link
                href="/agents/new"
                className="mt-6 inline-flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Agent
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
                  author={null} // We could fetch authors separately if needed
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
  );
}


