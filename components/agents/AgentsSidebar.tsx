"use client";

import { Plus, Layers, Code, Database, Globe, Smartphone, Server, Map, CreditCard } from "lucide-react";
import Link from "next/link";

const categoryIcons = {
  "Framework": Code,
  "Maps": Map,
  "Expo": Smartphone,
  "Database": Database,
  "Payments": CreditCard,
  "API": Server,
  "Web": Globe,
  "Mobile": Smartphone,
  "Backend": Server,
  "Frontend": Layers,
};

const categoryTypes = [
  "Framework",
  "Maps",
  "Expo",
  "Database",
  "Payments",
  "API",
  "Web",
  "Mobile",
  "Backend",
  "Frontend"
];

interface AgentsSidebarProps {
  selectedCategory: string | undefined;
  onCategoryChange: (category: string | undefined) => void;
}

export default function AgentsSidebar({ selectedCategory, onCategoryChange }: AgentsSidebarProps) {
  const handleSidebarScroll = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed left-0 top-[73px] w-64 bg-black/40 border-r border-white/10 h-[calc(100vh-73px)] p-6 z-10 flex flex-col">
      <div className="flex-1 overflow-y-auto" onWheel={handleSidebarScroll}>
        <div className="mb-6">
          {/* All Categories Button */}
          <button
            onClick={() => onCategoryChange(undefined)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2 ${
              !selectedCategory
                ? "bg-white text-black"
                : "text-white hover:bg-white/10"
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>All Categories</span>
          </button>

          {/* Category List */}
          <div className="space-y-2">
            {categoryTypes.map((categoryType) => {
              const IconComponent = categoryIcons[categoryType as keyof typeof categoryIcons] || Code;
              const isSelected = selectedCategory === categoryType;

              return (
                <button
                  key={categoryType}
                  onClick={() => onCategoryChange(categoryType)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-white text-black"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{categoryType}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <Link
          href="/agents/new"
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Submit</span>
        </Link>
      </div>
    </div>
  );
}