"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AgentCard from "@/components/agents/AgentCard";
import { Plus, Loader2, Database, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function MyAgentsPage() {
  const { isSignedIn } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const userStats = useQuery(api.users.getUserStats);

  const { results, status, loadMore } = usePaginatedQuery(
    api.agents.getMyAgents,
    {},
    { initialNumItems: 12 }
  );

  const isLoading = status === "LoadingFirstPage";

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-gray-400 mb-4">You need to sign in to view your agents.</p>
          <Link
            href="/sign-in"
            className="inline-flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/agents"
            className="text-gray-400 hover:text-white mb-4 inline-block transition-colors"
          >
            ← Back to All Agents
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">My Agents</h1>
              <p className="text-gray-400 text-lg">
                Manage and view all the AI coding agents you've created.
              </p>
            </div>

            <Link
              href="/agents/new"
              className="inline-flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        {currentUser && userStats && (
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center mb-4">
              {currentUser.profileImageUrl ? (
                <img
                  src={currentUser.profileImageUrl}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-white">{currentUser.name}</h2>
                <p className="text-gray-400 text-sm">
                  Member since {new Date(userStats.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userStats.agentCount}</div>
                <div className="text-sm text-gray-400">Agents Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userStats.totalViews}</div>
                <div className="text-sm text-gray-400">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userStats.totalLikes}</div>
                <div className="text-sm text-gray-400">Total Likes</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
            <p className="text-gray-400">Loading your agents...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Database className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No agents yet
            </h3>
            <p className="text-gray-400 text-center max-w-md">
              You haven't created any AI coding agents yet. Start by creating your first agent!
            </p>
            <Link
              href="/agents/new"
              className="mt-6 inline-flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Link>
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
                  author={currentUser}
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