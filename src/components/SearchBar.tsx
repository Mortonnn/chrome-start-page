"use client"

import { useState, useRef, useEffect } from "react"
import type { KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { Search, Mic } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SearchEngine = "google" | "bing" | "duckduckgo" | "yahoo"

const SEARCH_ENGINES: { id: SearchEngine; name: string; url: string; icon: string }[] = [
  { id: "google", name: "Google", url: "https://www.google.com/search?q=", icon: "G" },
  { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=", icon: "B" },
  { id: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=", icon: "DDG" },
  { id: "yahoo", name: "Yahoo", url: "https://search.yahoo.com/search?p=", icon: "Y" },
]

interface SearchBarProps {
  defaultEngine?: SearchEngine
  onSearch: (query: string, engine: SearchEngine) => void
}

export function SearchBar({ defaultEngine = "google", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [engine, setEngine] = useState<SearchEngine>(defaultEngine)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length > 1) {
      fetchSuggestions(query)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const fetchSuggestions = async (q: string) => {
    try {
      const res = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`
      )
      const data: unknown = await res.json()
      if (Array.isArray(data) && data[1] && Array.isArray(data[1]) && data[1].length > 0) {
        setSuggestions(data[1].slice(0, 6) as string[])
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    } catch {
      setShowSuggestions(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim(), engine)
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestion((prev) => Math.max(prev - 1, -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedSuggestion >= 0) {
          setQuery(suggestions[selectedSuggestion])
          onSearch(suggestions[selectedSuggestion], engine)
        } else if (query.trim()) {
          onSearch(query.trim(), engine)
        }
        setShowSuggestions(false)
        break
      case "Escape":
        setShowSuggestions(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    onSearch(suggestion, engine)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Select value={engine} onValueChange={(value) => setEngine(value as SearchEngine)}>
              <SelectTrigger className="h-8 px-2 py-0 bg-transparent border-0 hover:bg-accent rounded-md w-auto">
                <SelectValue placeholder="Google" className="text-sm font-medium" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" className="w-40">
                {SEARCH_ENGINES.map((e) => (
                  <SelectItem key={e.id} value={e.id} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                      {e.icon}
                    </span>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedSuggestion(-1)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 1 && setShowSuggestions(true)}
            placeholder="Search or type URL"
            className={cn(
              "w-full h-14 pl-20 pr-16 text-base bg-background border border-border",
              "rounded-xl placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-all duration-200 shadow-sm",
              "hover:shadow-md"
            )}
            autoComplete="off"
            autoFocus
            spellCheck={false}
          />

          <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-1">
            <button
              type="button"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Voice search"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="submit"
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedSuggestion(index)}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm hover:bg-accent transition-colors",
                  "flex items-center gap-3",
                  index === selectedSuggestion && "bg-accent"
                )}
              >
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}