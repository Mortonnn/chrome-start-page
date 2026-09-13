"use client"

import { useState, useRef, useEffect } from "react"
import type { KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { Search, Mic, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

type SearchEngine = "google" | "bing" | "duckduckgo" | "yahoo"

interface SpeechRecognitionInstance {
  lang: string
  interimResults: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

interface VoiceWindow extends Window {
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  SpeechRecognition?: new () => SpeechRecognitionInstance
}

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
  const [listening, setListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

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

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

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

  const handleVoiceSearch = () => {
    const voiceWindow = window as VoiceWindow
    const Recognition = voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition

    if (!Recognition) {
      inputRef.current?.focus()
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new Recognition()
    recognition.lang = "zh-CN"
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) {
        setQuery(transcript)
        onSearch(transcript, engine)
        setShowSuggestions(false)
      }
    }
    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }

  const currentEngine = SEARCH_ENGINES.find((item) => item.id === engine) ?? SEARCH_ENGINES[0]

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[920px]">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex h-14 items-center gap-1 rounded-full border border-border bg-background px-2 shadow-[0_1px_4px_rgba(0,0,0,0.08)] transition-shadow focus-within:shadow-[0_2px_10px_rgba(0,0,0,0.12)] focus-within:outline-none focus-within:ring-2 focus-within:ring-ring hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)]">
          <Select value={engine} onValueChange={(value) => setEngine(value as SearchEngine)}>
            <SelectTrigger
              aria-label="选择搜索引擎"
              className="h-10 shrink-0 gap-2 rounded-full border-0 bg-transparent px-3 text-sm font-medium hover:bg-accent focus:ring-0 focus:ring-offset-0"
            >
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", currentEngine.badgeClass)}>
                {currentEngine.badge}
              </span>
              <span className="hidden sm:inline">{currentEngine.name}</span>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start" className="w-48">
              {SEARCH_ENGINES.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <span className="flex items-center gap-2">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", item.badgeClass)}>
                      {item.badge}
                    </span>
                    {item.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />
          <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />

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
            placeholder={`在 ${currentEngine.name} 中搜索，或者输入一个网址`}
            className="h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoComplete="off"
            autoFocus
            spellCheck={false}
            aria-label="搜索"
          />

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={cn(
                "rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                listening && "bg-accent text-primary"
              )}
              aria-label={listening ? "停止语音输入" : "语音搜索"}
              title={listening ? "停止语音输入" : "语音搜索"}
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="submit"
              className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
              aria-label="搜索"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl animate-fade-in">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedSuggestion(index)}
                className={cn(
                  "flex w-full items-center gap-3 px-5 py-3 text-left text-[15px] transition-colors hover:bg-accent",
                  index === selectedSuggestion && "bg-accent"
                )}
              >
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}
