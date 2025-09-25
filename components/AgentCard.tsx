"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye, User } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";

interface AgentCardProps {
  agent: Doc<"agents">;
  onView?: () => void;
}

export function AgentCard({ agent, onView }: AgentCardProps) {
  const [isLiking, setIsLiking] = useState(false);

  const toggleLike = useMutation(api.agents.toggleLike);
  const hasUserLikedAgent = useQuery(api.agents.hasUserLikedAgent, {
    agentId: agent._id,
  });
  const incrementViews = useMutation(api.agents.incrementViews);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking) return;

    setIsLiking(true);
    try {
      await toggleLike({ agentId: agent._id });
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCardClick = () => {
    incrementViews({ agentId: agent._id });
    onView?.();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
      <Link href={`/agents/${agent._id}`} onClick={handleCardClick}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {agent.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {agent.category}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className="p-1 h-8 w-8"
            >
              <Heart
                className={`h-4 w-4 ${
                  hasUserLikedAgent
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                } transition-colors`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {agent.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {agent.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {agent.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{agent.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {agent.likes || 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {agent.views || 0}
              </span>
            </div>
            <span>{formatDate(agent.createdAt)}</span>
          </div>

          {/* Author info if available */}
          {agent.authorId && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Created by user
              </span>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}