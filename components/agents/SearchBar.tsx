"use client";

import { Search, X, Filter } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryChange?: (category: string | undefined) => void;
  categories?: string[];
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  onCategoryChange,
  categories = [],
  placeholder = "Search for agents or MCPs...",
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  const handleCategoryChange = (category: string | undefined) => {
    setSelectedCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedCategory(undefined);
    onSearch("");
    if (onCategoryChange) {
      onCategoryChange(undefined);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-neutral-600 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-24 py-4 bg-black/20 border border-neutral-800 rounded-2xl text-neutral-400 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
          />
          <div className="absolute right-2 flex items-center space-x-2">
            {(searchQuery || selectedCategory) && (
              <button
                onClick={handleClear}
                className="p-2 text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {categories.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters || selectedCategory
                    ? "text-neutral-400 bg-black/40"
                    : "text-neutral-600 hover:text-neutral-400"
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        {showFilters && categories.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-black/90 backdrop-blur-xl border border-neutral-800 rounded-2xl z-50">
            <div className="mb-2 text-xs text-neutral-600 uppercase tracking-wider">
              Filter by Category
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(undefined)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !selectedCategory
                    ? "bg-neutral-700 text-neutral-300"
                    : "bg-black/30 text-neutral-500 hover:bg-black/40"
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-neutral-700 text-neutral-300"
                      : "bg-black/30 text-neutral-500 hover:bg-black/40"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results Info */}
      {(searchQuery || selectedCategory) && (
        <div className="mt-4 text-sm text-neutral-600">
          {searchQuery && (
            <span>
              Searching for "<span className="text-neutral-400">{searchQuery}</span>"
            </span>
          )}
          {searchQuery && selectedCategory && <span> in </span>}
          {selectedCategory && (
            <span className="text-neutral-400">{selectedCategory}</span>
          )}
        </div>
      )}
    </div>
  );
}