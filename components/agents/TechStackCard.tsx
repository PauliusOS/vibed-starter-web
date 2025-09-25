"use client";

import { Heart, Eye, Code } from "lucide-react";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";

interface TechStackCardProps {
  agent: Doc<"agents">;
  techStack: string;
  author?: Doc<"users"> | null;
}

// Get Brandfetch client ID from environment variable
const clientId = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || "";

// Domain mappings for tech stacks
const techStackDomains: Record<string, string> = {
  "nextjs": "nextjs.org",
  "expo": "expo.dev",
  "stripe": "stripe.com",
  "convex": "convex.dev",
  "mapbox": "mapbox.com",
  "react": "reactjs.org",
  "typescript": "typescriptlang.org",
  "tailwind": "tailwindcss.com",
  "prisma": "prisma.io",
  "supabase": "supabase.com",
  "vercel": "vercel.com",
  "clerk": "clerk.com",
  "firebase": "firebase.google.com",
  "mongodb": "mongodb.com",
  "postgresql": "postgresql.org",
};

// Product type categorization for tech stacks
const techStackTypes: Record<string, string> = {
  "nextjs": "Framework",
  "expo": "Framework",
  "stripe": "API",
  "convex": "Backend",
  "mapbox": "API",
  "react": "Frontend",
  "typescript": "Language",
  "tailwind": "Styling",
  "prisma": "Backend",
  "supabase": "Backend",
  "vercel": "Platform",
  "clerk": "Auth",
  "firebase": "Backend",
  "mongodb": "Database",
  "postgresql": "Database",
};

export default function TechStackCard({ agent, techStack, author }: TechStackCardProps) {
  const domain = techStackDomains[techStack.toLowerCase()] || "reactjs.org";
  const logoUrl = `https://cdn.brandfetch.io/${domain}/icon/theme/dark/w/512/h/512?c=${clientId}`;
  const productType = techStackTypes[techStack.toLowerCase()] || "Tool";

  return (
    <Link href={`/agents/${agent._id}`}>
      <div className="group relative bg-black/40 border border-white/20 rounded-3xl p-5 hover:border-white/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] cursor-pointer h-56 flex flex-col">
        {/* Header with logo and title */}
        <div className="flex items-start mb-3">
          <img
            src={logoUrl}
            alt={`${techStack} logo`}
            className="w-10 h-10 rounded-lg object-contain mr-3 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex-1 -mt-0.5">
            <h3 className="text-base font-bold text-white group-hover:text-white/90 mb-0.5 leading-tight">
              {agent.name}
            </h3>
            <span className="inline-block text-xs font-medium text-gray-300 bg-white/10 border border-white/20 px-2 py-0.5 rounded">
              {productType}
            </span>
          </div>
          {!agent.isPublic && (
            <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded ml-2">
              Private
            </span>
          )}
        </div>

        {/* Description in typewriter-style container */}
        <div className="bg-black/60 rounded-xl p-3 mb-3 flex-grow">
          <p className="text-gray-400 text-xs line-clamp-3 font-mono">
            {agent.description}
          </p>
        </div>


        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
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
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </Link>
  );
}