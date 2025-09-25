"use client";

import { Heart, Eye, Code, Tag } from "lucide-react";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";

interface AgentCardProps {
  agent: Doc<"agents">;
  author?: Doc<"users"> | null;
}

export default function AgentCard({ agent, author }: AgentCardProps) {
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
    <Link href={`/agents/${agent._id}`}>
      <div className="group relative bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] cursor-pointer h-80 flex flex-col">
        {/* Category Badge */}
        <div className="flex justify-between items-start mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${categoryStyle}`}>
            <Code className="w-3 h-3 mr-1" />
            {agent.category}
          </span>
          {!agent.isPublic && (
            <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
              Private
            </span>
          )}
        </div>

        {/* Agent Name */}
        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90">
          {agent.name}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
          {agent.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
          {agent.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center text-xs text-gray-500 bg-gray-900/50 px-2 py-1 rounded-md"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {agent.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{agent.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {agent.views || 0}
            </span>
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {agent.likes || 0}
            </span>
          </div>
          {author && (
            <div className="flex items-center">
              {author.profileImageUrl && (
                <img
                  src={author.profileImageUrl}
                  alt={author.name}
                  className="w-6 h-6 rounded-full mr-2"
                />
              )}
              <span className="text-xs text-gray-500">{author.name}</span>
            </div>
          )}
        </div>

        {/* Hover Gradient Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </Link>
  );
}