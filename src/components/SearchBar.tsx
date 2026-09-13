"use client"

import { useState, useRef, useEffect } from "react"
import type { KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

type SearchEngine = "google" | "bing" | "duckduckgo" | "yahoo"

const SEARCH_ENGINES: { id: SearchEngine; name: string; url: string; badge: string; badgeClass: string }[] = [
  { id: "google", name: "Google", url: "https://www.google.com/search?q=", badge: "G", badgeClass: "bg-[#4285F4] text-white" },
  { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=", badge: "B", badgeClass: "bg-[#0c8484] text-white" },
  { id: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=", badge: "D", badgeClass: "bg-[#de5833] text-white" },
  { id: "yahoo", name: "Yahoo", url: "https://search.yahoo.com/search?p=", badge: "Y", badgeClass: "bg-[#6001d2] text-white" },
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
    setEngine(defaultEngine)
  }, [defaultEngine])

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

  const currentEngine = SEARCH_ENGINES.find((item) => item.id === engine) ?? SEARCH_ENGINES[0]

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[920px]">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex h-14 items-center rounded-full border border-[#dfe1e5] bg-white px-1 shadow-[0_1px_6px_rgba(32,33,36,0.12)] transition-shadow focus-within:shadow-[0_2px_10px_rgba(32,33,36,0.18)] hover:shadow-[0_2px_8px_rgba(32,33,36,0.16)] dark:border-transparent dark:bg-[#303134] dark:shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
          <Select value={engine} onValueChange={(value) => setEngine(value as SearchEngine)}>
            <SelectTrigger
              aria-label="选择搜索引擎"
              className="h-12 min-w-0 shrink-0 items-center gap-2 rounded-full border-0 bg-transparent px-2 text-sm font-medium text-[#202124] hover:bg-[#f1f3f4] focus:ring-0 focus:ring-offset-0 dark:text-[#e8eaed] dark:hover:bg-[#3c4043]"
            >
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold", currentEngine.badgeClass)}>
                {currentEngine.badge}
              </span>
              <span className="hidden max-w-[132px] truncate sm:inline">{currentEngine.name}</span>
            </SelectTrigger>
            <SelectContent side="bottom" align="start" className="w-52 border-[#dfe1e5] bg-white dark:border-transparent dark:bg-[#303134]">
              {SEARCH_ENGINES.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <span className="flex items-center gap-2 text-[#202124] dark:text-[#e8eaed]">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", item.badgeClass)}>
                      {item.badge}
                    </span>
                    {item.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mx-1 h-6 w-px shrink-0 bg-[#dfe1e5] dark:bg-[#5f6368]" aria-hidden="true" />

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
            placeholder={`问问 ${currentEngine.name}`}
            className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-[16px] text-[#202124] placeholder:text-[#5f6368] focus:outline-none dark:text-[#e8eaed] dark:placeholder:text-[#9aa0a6]"
            autoComplete="off"
            autoFocus
            spellCheck={false}
            aria-label="搜索"
          />

          <button
            type="submit"
            className="mr-1 shrink-0 rounded-full p-2.5 text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]"
            aria-label="搜索"
            title="搜索"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#dfe1e5] bg-white shadow-[0_8px_24px_rgba(32,33,36,0.18)] animate-fade-in dark:border-transparent dark:bg-[#303134]">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedSuggestion(index)}
                className={cn(
                  "flex w-full items-center gap-3 px-5 py-3 text-left text-[15px] text-[#202124] transition-colors hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#3c4043]",
                  index === selectedSuggestion && "bg-[#f1f3f4] dark:bg-[#3c4043]"
                )}
              >
                <Search className="h-4 w-4 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
                <span className="truncate">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}
