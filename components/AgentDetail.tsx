"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye, User, Calendar, Tag, Wrench, ArrowLeft } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AgentDetailProps {
  agent: Doc<"agents"> & {
    author?: Doc<"users"> | null;
  };
}

export function AgentDetail({ agent }: AgentDetailProps) {
  const router = useRouter();
  const [isLiking, setIsLiking] = useState(false);

  const toggleLike = useMutation(api.agents.toggleLike);
  const hasUserLikedAgent = useQuery(api.agents.hasUserLikedAgent, {
    agentId: agent._id,
  });
  const incrementViews = useMutation(api.agents.incrementViews);

  // Increment views when component mounts
  useEffect(() => {
    incrementViews({ agentId: agent._id });
  }, [agent._id, incrementViews]);

  const handleLike = async () => {
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Main content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-3xl">{agent.name}</CardTitle>
                <Badge variant="outline" className="text-sm">
                  {agent.category}
                </Badge>
              </div>
              <CardDescription className="text-lg">
                {agent.description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center gap-2"
            >
              <Heart
                className={`h-5 w-5 ${
                  hasUserLikedAgent
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                } transition-colors`}
              />
              {agent.likes || 0}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Stats bar */}
          <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{agent.likes || 0}</span>
              <span className="text-sm text-muted-foreground">likes</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{agent.views || 0}</span>
              <span className="text-sm text-muted-foreground">views</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Created {formatDate(agent.createdAt)}
              </span>
            </div>
          </div>

          {/* Rules/Capabilities */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>Rules & Capabilities</span>
            </h3>
            <div className="space-y-3">
              {agent.rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p className="text-sm">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {agent.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tools */}
          {agent.tools.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Tools & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {agent.tools.map((tool) => (
                  <Badge key={tool} variant="outline">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Author info */}
          {agent.author && (
            <div className="pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {agent.author.profileImageUrl ? (
                    <img
                      src={agent.author.profileImageUrl}
                      alt={agent.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{agent.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {agent.author.agentCount || 1} agent{(agent.author.agentCount || 1) === 1 ? "" : "s"} created
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t text-sm text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Created:</span> {formatDate(agent.createdAt)}
              </div>
              <div>
                <span className="font-medium">Last updated:</span> {formatDate(agent.updatedAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}