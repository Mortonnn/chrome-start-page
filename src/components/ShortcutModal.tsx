"use client"

import { useState, useEffect, useRef } from "react"
import { X, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Shortcut {
  id: string
  title: string
  url: string
}

interface ShortcutModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (shortcut: Omit<Shortcut, "id">) => void
  initialData?: Shortcut | null
  isLoading?: boolean
}

export function ShortcutModal({ isOpen, onClose, onSubmit, initialData, isLoading }: ShortcutModalProps) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [favicon, setFavicon] = useState<string | null>(null)
  const [fetchingFavicon, setFetchingFavicon] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title)
        setUrl(initialData.url)
        fetchFavicon(initialData.url)
      } else {
        setTitle("")
        setUrl("")
        setFavicon(null)
      }
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [isOpen, initialData])

  const fetchFavicon = async (urlString: string) => {
    try {
      setFetchingFavicon(true)
      const hostname = new URL(urlString).hostname
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
      setFavicon(faviconUrl)
    } catch {
      setFavicon(null)
    } finally {
      setFetchingFavicon(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)
    if (value.length > 5) {
      fetchFavicon(value)
    } else {
      setFavicon(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && url.trim()) {
      let formattedUrl = url.trim()
      if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
        formattedUrl = "https://" + formattedUrl
      }
      onSubmit({ title: title.trim(), url: formattedUrl })
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="modal-title" className="text-lg font-semibold">
            {initialData ? "Edit Shortcut" : "Add Shortcut"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Name
            </label>
            <Input
              ref={titleRef}
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., GitHub"
              className="h-11 text-base"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              URL
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Globe className="h-5 w-5" />
              </span>
              <Input
                ref={urlRef}
                id="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className="h-11 text-base pl-11"
                autoComplete="off"
                onKeyDown={handleKeyDown}
              />
              {fetchingFavicon && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
              )}
            </div>
            {favicon && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <img src={favicon} alt="" className="w-5 h-5 rounded" />
                <span>Favicon loaded</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !url.trim()}
              className="flex-1"
            >
              {isLoading ? "Saving..." : initialData ? "Save Changes" : "Add Shortcut"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}