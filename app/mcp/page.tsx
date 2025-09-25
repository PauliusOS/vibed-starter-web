"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { Copy, Check, Terminal, Server } from "lucide-react";

interface McpCommand {
  name: string;
  description: string;
  command: string;
  category: string;
  icon: React.ReactNode;
}

const mcpCommands: McpCommand[] = [
  {
    name: "File System",
    description: "Access and manipulate files and directories on your local system",
    command: "npx @modelcontextprotocol/server-filesystem /path/to/directory",
    category: "System",
    icon: <Terminal className="w-8 h-8" />
  },
  {
    name: "Git",
    description: "Interact with Git repositories, manage branches, commits, and more",
    command: "npx @modelcontextprotocol/server-git",
    category: "Development",
    icon: <Server className="w-8 h-8" />
  },
  {
    name: "SQLite",
    description: "Query and manage SQLite databases with natural language",
    command: "npx @modelcontextprotocol/server-sqlite /path/to/database.db",
    category: "Database",
    icon: <Terminal className="w-8 h-8" />
  },
  {
    name: "PostgreSQL",
    description: "Connect to and query PostgreSQL databases",
    command: "npx @modelcontextprotocol/server-postgres postgresql://user:password@localhost:5432/dbname",
    category: "Database",
    icon: <Server className="w-8 h-8" />
  },
  {
    name: "Brave Search",
    description: "Search the web using Brave's search API",
    command: "npx @modelcontextprotocol/server-brave-search",
    category: "Search",
    icon: <Terminal className="w-8 h-8" />
  },
  {
    name: "GitHub",
    description: "Interact with GitHub repositories, issues, and pull requests",
    command: "npx @modelcontextprotocol/server-github",
    category: "Development",
    icon: <Server className="w-8 h-8" />
  },
  {
    name: "Google Drive",
    description: "Access and manage files in Google Drive",
    command: "npx @modelcontextprotocol/server-gdrive",
    category: "Storage",
    icon: <Terminal className="w-8 h-8" />
  },
  {
    name: "Slack",
    description: "Send messages and interact with Slack workspaces",
    command: "npx @modelcontextprotocol/server-slack",
    category: "Communication",
    icon: <Server className="w-8 h-8" />
  },
  {
    name: "Memory",
    description: "Persistent memory storage for Claude conversations",
    command: "npx @modelcontextprotocol/server-memory",
    category: "Utilities",
    icon: <Terminal className="w-8 h-8" />
  },
  {
    name: "Everart",
    description: "Generate images using the Everart API",
    command: "npx @modelcontextprotocol/server-everart",
    category: "AI",
    icon: <Server className="w-8 h-8" />
  },
  {
    name: "Puppeteer",
    description: "Web scraping and browser automation",
    command: "npx @modelcontextprotocol/server-puppeteer",
    category: "Web",
    icon: <Terminal className="w-8 h-8" />
  },
  {
    name: "YouTube Transcript",
    description: "Extract transcripts from YouTube videos",
    command: "npx @modelcontextprotocol/server-youtube-transcript",
    category: "Media",
    icon: <Server className="w-8 h-8" />
  },
];

const categories = ["All", "System", "Development", "Database", "Search", "Storage", "Communication", "Utilities", "AI", "Web", "Media"];

export default function McpPage() {
  const { isSignedIn } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const filteredCommands = selectedCategory === "All"
    ? mcpCommands
    : mcpCommands.filter(cmd => cmd.category === selectedCategory);

  const copyToClipboard = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

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
                className="text-sm text-white hover:text-gray-300 transition-colors uppercase tracking-wider"
              >
                Agents
              </Link>
              <Link
                href="/mcp"
                className="text-sm text-white hover:text-gray-300 transition-colors uppercase tracking-wider border-b-2 border-white"
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
          <div className="flex justify-center mb-6">
            <Server className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            MCP Server Directory
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Model Context Protocol (MCP) servers extend Claude's capabilities.
            Copy and run these commands to add powerful tools to your Claude experience.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? "bg-white text-black"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* MCP Commands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommands.map((cmd, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-white">
                    {cmd.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {cmd.name}
                    </h3>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      {cmd.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-6">
                {cmd.description}
              </p>

              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <code className="text-green-400 text-sm break-all">
                  {cmd.command}
                </code>
              </div>

              <button
                onClick={() => copyToClipboard(cmd.command)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                {copiedCommand === cmd.command ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">How to Use MCP Servers</h2>
            <div className="text-left space-y-4 text-gray-300">
              <p>
                <strong className="text-white">1. Install an MCP server:</strong> Copy one of the commands above and run it in your terminal.
              </p>
              <p>
                <strong className="text-white">2. Configure Claude Desktop:</strong> Add the server configuration to your Claude Desktop settings.
              </p>
              <p>
                <strong className="text-white">3. Restart Claude Desktop:</strong> The new capabilities will be available in your next conversation.
              </p>
            </div>
            <div className="mt-6 text-sm text-gray-400">
              Learn more about MCP at{" "}
              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 underline"
              >
                modelcontextprotocol.io
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}