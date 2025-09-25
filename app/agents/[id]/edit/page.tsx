"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";

export default function EditAgentPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const agentId = params.id as Id<"agents">;

  const agent = useQuery(api.agents.getAgentById, { agentId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateAgent = useMutation(api.agents.updateAgent);
  const categories = useQuery(api.agents.getCategories) || [];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isPublic: true,
  });

  const [rules, setRules] = useState<string[]>([""]);
  const [tags, setTags] = useState<string[]>([""]);
  const [tools, setTools] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description,
        category: agent.category,
        isPublic: agent.isPublic,
      });
      setRules(agent.rules.length > 0 ? agent.rules : [""]);
      setTags(agent.tags.length > 0 ? agent.tags : [""]);
      setTools(agent.tools.length > 0 ? agent.tools : [""]);
    }
  }, [agent]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-gray-400 mb-4">You need to sign in to edit agents.</p>
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

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Not authorized</h2>
          <p className="text-gray-400 mb-4">You can only edit your own agents.</p>
          <Link
            href={`/agents/${agentId}`}
            className="inline-flex items-center text-white hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agent
          </Link>
        </div>
      </div>
    );
  }

  const handleArrayItemChange = (
    array: string[],
    setter: (arr: string[]) => void,
    index: number,
    value: string
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const addArrayItem = (array: string[], setter: (arr: string[]) => void) => {
    setter([...array, ""]);
  };

  const removeArrayItem = (
    array: string[],
    setter: (arr: string[]) => void,
    index: number
  ) => {
    if (array.length > 1) {
      setter(array.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Filter out empty values
    const filteredRules = rules.filter(r => r.trim());
    const filteredTags = tags.filter(t => t.trim());
    const filteredTools = tools.filter(t => t.trim());

    // Validation
    if (formData.name.length < 3 || formData.name.length > 100) {
      setError("Agent name must be between 3 and 100 characters");
      return;
    }

    if (formData.description.length < 10 || formData.description.length > 2000) {
      setError("Description must be between 10 and 2000 characters");
      return;
    }

    if (filteredRules.length === 0) {
      setError("Please add at least one rule");
      return;
    }

    if (filteredTags.length === 0) {
      setError("Please add at least one tag");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateAgent({
        agentId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        rules: filteredRules,
        tags: filteredTags,
        tools: filteredTools,
        isPublic: formData.isPublic,
      });

      router.push(`/agents/${agentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update agent");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <Link
          href={`/agents/${agentId}`}
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Agent
        </Link>

        <div className="bg-black/40 border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Edit Agent</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                placeholder="e.g., React Component Generator"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 min-h-[100px]"
                placeholder="Describe what this agent does and its capabilities..."
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rules & Capabilities *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Define the specific rules, capabilities, and behaviors of your agent.
              </p>
              {rules.map((rule, index) => (
                <div key={index} className="flex mb-2">
                  <textarea
                    value={rule}
                    onChange={(e) => handleArrayItemChange(rules, setRules, index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-black/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                    placeholder="e.g., Generate React components using TypeScript and modern hooks..."
                  />
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(rules, setRules, index)}
                      className="ml-2 p-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem(rules, setRules)}
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Rule
              </button>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Add relevant tags to help users find your agent (e.g., programming languages, frameworks).
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayItemChange(tags, setTags, index, e.target.value)}
                      className="px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                      placeholder="e.g., React"
                    />
                    {tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(tags, setTags, index)}
                        className="ml-1 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(tags, setTags)}
                  className="inline-flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Tag
                </button>
              </div>
            </div>

            {/* Tools */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tools (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                List any tools or integrations this agent uses.
              </p>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool, index) => (
                  <div key={index} className="flex">
                    <input
                      type="text"
                      value={tool}
                      onChange={(e) => handleArrayItemChange(tools, setTools, index, e.target.value)}
                      className="px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                      placeholder="e.g., GitHub"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(tools, setTools, index)}
                      className="ml-1 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(tools, setTools)}
                  className="inline-flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Tool
                </button>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 bg-black/60 border-gray-600 rounded focus:ring-2 focus:ring-white"
                />
                <span className="text-sm font-medium text-gray-300">
                  Make this agent public
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                Public agents can be viewed and used by everyone. Private agents are only visible to you.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
              <Link
                href={`/agents/${agentId}`}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}