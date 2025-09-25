"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Heart, Eye, Code, Tag, Wrench, Shield, ArrowLeft, Edit, Trash, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const agentId = params.id as Id<"agents">;

  // Fetch agent data
  const agent = useQuery(api.agents.getAgentById, { agentId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const hasLiked = useQuery(api.agents.hasUserLikedAgent, { agentId });

  // Mutations
  const toggleLike = useMutation(api.agents.toggleLike);
  const deleteAgent = useMutation(api.agents.deleteAgent);
  const incrementViews = useMutation(api.agents.incrementViews);

  // Increment views on mount
  useEffect(() => {
    if (agentId) {
      incrementViews({ agentId });
    }
  }, [agentId, incrementViews]);

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Agent not found</h2>
          <p className="text-gray-400 mb-4">This agent may have been removed or is not accessible.</p>
          <Link
            href="/agents"
            className="inline-flex items-center text-white hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && agent.authorId === currentUser._id;

  const handleLike = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }
    await toggleLike({ agentId });
  };

  const handleDelete = async () => {
    if (!isOwner || isDeleting) return;

    if (confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await deleteAgent({ agentId });
        router.push("/agents");
      } catch (error) {
        console.error("Failed to delete agent:", error);
        setIsDeleting(false);
      }
    }
  };

  const handleCopyRules = () => {
    const rulesText = agent.rules.join("\n\n");
    navigator.clipboard.writeText(rulesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryColors: Record<string, string> = {
    "Code Generation": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Debugging": "bg-red-500/10 text-red-500 border-red-500/20",
    "Refactoring": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "Testing": "bg-green-500/10 text-green-500 border-green-500/20",
    "Documentation": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "DevOps": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "Database": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    "Security": "bg-red-600/10 text-red-600 border-red-600/20",
    "Performance": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    "UI/UX": "bg-pink-500/10 text-pink-500 border-pink-500/20",
    "API Development": "bg-teal-500/10 text-teal-500 border-teal-500/20",
    "Data Analysis": "bg-lime-500/10 text-lime-500 border-lime-500/20",
    "Machine Learning": "bg-violet-500/10 text-violet-500 border-violet-500/20",
    "Other": "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  const categoryStyle = categoryColors[agent.category] || categoryColors["Other"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Link
          href="/agents"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Agents
        </Link>

        {/* Agent Header */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${categoryStyle}`}>
                  <Code className="w-4 h-4 mr-1" />
                  {agent.category}
                </span>
                {!agent.isPublic && (
                  <span className="text-sm text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Private
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">{agent.name}</h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                {agent.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={handleLike}
                className={`p-3 rounded-lg transition-colors ${
                  hasLiked
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-gray-400 hover:text-white hover:bg-white/20"
                }`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
              </button>
              {isOwner && (
                <>
                  <Link
                    href={`/agents/${agentId}/edit`}
                    className="p-3 bg-white/10 text-gray-400 rounded-lg hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-3 bg-white/10 text-gray-400 rounded-lg hover:text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {agent.views || 0} views
            </span>
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {agent.likes || 0} likes
            </span>
            {agent.author && (
              <div className="flex items-center">
                {agent.author.profileImageUrl && (
                  <img
                    src={agent.author.profileImageUrl}
                    alt={agent.author.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                )}
                <span>Created by {agent.author.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Agent Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules Section */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Agent Rules & Capabilities</h2>
                <button
                  onClick={handleCopyRules}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Copy rules"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="space-y-3">
                {agent.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="p-4 bg-black/60 border border-white/5 rounded-lg"
                  >
                    <p className="text-gray-300 leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {agent.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center text-sm text-gray-300 bg-gray-900/50 px-3 py-1.5 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tools */}
            {agent.tools.length > 0 && (
              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Tools
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agent.tools.map((tool, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center text-sm text-gray-300 bg-gray-900/50 px-3 py-1.5 rounded-lg"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Information</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="text-gray-300">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last Updated</dt>
                  <dd className="text-gray-300">
                    {new Date(agent.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Visibility</dt>
                  <dd className="text-gray-300">
                    {agent.isPublic ? "Public" : "Private"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}