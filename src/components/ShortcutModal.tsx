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
  focusField?: "title" | "url"
}

export function ShortcutModal({ isOpen, onClose, onSubmit, initialData, isLoading, focusField = "title" }: ShortcutModalProps) {
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
      const target = focusField === "url" || initialData ? urlRef.current : titleRef.current
      const timer = window.setTimeout(() => {
        target?.focus()
        if (target === urlRef.current) target?.select()
      }, 100)
      return () => window.clearTimeout(timer)
    }
  }, [isOpen, initialData, focusField])

  const fetchFavicon = async (urlString: string) => {
    try {
      setFetchingFavicon(true)
      const hostname = new URL(urlString).hostname
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="modal-title" className="text-lg font-semibold">
            {initialData ? "编辑快捷方式" : "添加快捷方式"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="关闭弹窗"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              名称
            </label>
            <Input
              ref={titleRef}
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：GitHub"
              className="h-11 bg-background text-base"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              网址
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
                className="h-11 bg-background pl-11 text-base"
                autoComplete="off"
                onKeyDown={handleKeyDown}
              />
              {fetchingFavicon && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
              )}
            </div>
            {favicon && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <img src={favicon} alt="" className="h-5 w-5 rounded bg-white object-contain p-0.5" />
                <span>已识别网站图标</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-background"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !url.trim()}
              className="flex-1"
            >
              {isLoading ? "保存中..." : initialData ? "保存修改" : "添加"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}