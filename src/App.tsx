"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Sun, Moon } from "lucide-react"
import { GoogleLogo } from "@/components/GoogleLogo"
import { SearchBar } from "@/components/SearchBar"
import { ShortcutsGrid } from "@/components/ShortcutsGrid"
import { ShortcutModal } from "@/components/ShortcutModal"
import { SettingsModal } from "@/components/SettingsModal"
import { Button } from "@/components/ui/button"

interface Shortcut {
  id: string
  title: string
  url: string
}

type SearchEngine = "google" | "bing" | "duckduckgo" | "yahoo"
type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "chrome-start-page-data"
const SETTINGS_KEY = "chrome-start-page-settings"

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: "1", title: "YouTube", url: "https://youtube.com" },
  { id: "2", title: "Gmail", url: "https://mail.google.com" },
  { id: "3", title: "Google Maps", url: "https://maps.google.com" },
  { id: "4", title: "Google Drive", url: "https://drive.google.com" },
  { id: "5", title: "GitHub", url: "https://github.com" },
  { id: "6", title: "Twitter", url: "https://twitter.com" },
  { id: "7", title: "Reddit", url: "https://reddit.com" },
  { id: "8", title: "Netflix", url: "https://netflix.com" },
]

interface Settings {
  searchEngine: SearchEngine
  theme: Theme
}

const DEFAULT_SETTINGS: Settings = {
  searchEngine: "google",
  theme: "system",
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    root.classList.add(prefersDark ? "dark" : "light")
  } else {
    root.classList.add(theme)
  }
}

export default function App() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null)
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setShortcuts(parsed)
        }
      } catch {
        setShortcuts(DEFAULT_SHORTCUTS)
      }
    } else {
      setShortcuts(DEFAULT_SHORTCUTS)
    }

    const storedSettings = localStorage.getItem(SETTINGS_KEY)
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings))
      } catch {
        setSettings(DEFAULT_SETTINGS)
      }
    }

    applyTheme(settings.theme)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts))
  }, [shortcuts])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    applyTheme(settings.theme)
  }, [settings])

  const handleSearch = useCallback((query: string, engine: SearchEngine) => {
    const urls: Record<SearchEngine, string> = {
      google: "https://www.google.com/search?q=",
      bing: "https://www.bing.com/search?q=",
      duckduckgo: "https://duckduckgo.com/?q=",
      yahoo: "https://search.yahoo.com/search?p=",
    }
    window.open(`${urls[engine]}${encodeURIComponent(query)}`, "_self")
  }, [])

  const handleAddShortcut = useCallback(async (shortcut: Omit<Shortcut, "id">) => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 300))
    setShortcuts([...shortcuts, { ...shortcut, id: generateId() }])
    setIsSaving(false)
  }, [shortcuts])

  const handleEditShortcut = useCallback((shortcut: Shortcut) => {
    setEditingShortcut(shortcut)
    setIsEditingModalOpen(true)
  }, [])

  const handleUpdateShortcut = useCallback(async (updated: Omit<Shortcut, "id">) => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 300))
    setShortcuts(shortcuts.map(s => s.id === editingShortcut?.id ? { ...updated, id: s.id } : s))
    setEditingShortcut(null)
    setIsEditingModalOpen(false)
    setIsSaving(false)
  }, [shortcuts, editingShortcut])

  const handleDeleteShortcut = useCallback((id: string) => {
    if (confirm("Delete this shortcut?")) {
      setShortcuts(shortcuts.filter(s => s.id !== id))
    }
  }, [shortcuts])

  const handleClearData = useCallback(() => {
    setShortcuts([])
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SETTINGS_KEY)
  }, [])

  const handleExportData = useCallback(() => {
    const data = { shortcuts, settings, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chrome-start-page-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [shortcuts, settings])

  const handleImportData = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.shortcuts && Array.isArray(data.shortcuts)) {
          setShortcuts(data.shortcuts)
        }
        if (data.settings) {
          setSettings(data.settings)
        }
        alert("Data imported successfully!")
      } catch {
        alert("Invalid file format")
      }
    }
    reader.readAsText(file)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <GoogleLogo className="w-32 h-auto mx-auto mb-6 text-primary" />
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="relative flex flex-col items-center min-h-screen px-4 py-12"
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettingsModal(true)}
              className="h-10 w-10 rounded-xl"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettings(prev => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" }))}
              className="h-10 w-10 rounded-xl"
              aria-label="Toggle theme"
            >
              {settings.theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          <div className="w-full max-w-5xl flex flex-col items-center gap-8 animate-fade-in">
            <GoogleLogo className="w-[272px] h-auto animate-slide-up" />

            <SearchBar
              defaultEngine={settings.searchEngine}
              onSearch={handleSearch}
            />

            <ShortcutsGrid
              shortcuts={shortcuts}
              onAddShortcut={() => setShowAddModal(true)}
              onEditShortcut={handleEditShortcut}
              onDeleteShortcut={handleDeleteShortcut}
              isEditing={false}
            />

            <div className="w-full max-w-5xl px-4 pt-4">
              <p className="text-center text-xs text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">/</kbd> to focus search &nbsp;|&nbsp;
                <span className="hidden sm:inline">Double-click shortcuts to edit</span>
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <ShortcutModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddShortcut}
        isLoading={isSaving}
      />

      <ShortcutModal
        isOpen={isEditingModalOpen}
        onClose={() => {
          setIsEditingModalOpen(false)
          setEditingShortcut(null)
        }}
        onSubmit={handleUpdateShortcut}
        initialData={editingShortcut}
        isLoading={isSaving}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        searchEngine={settings.searchEngine}
        onSearchEngineChange={(engine) => setSettings(prev => ({ ...prev, searchEngine: engine }))}
        theme={settings.theme}
        onThemeChange={(theme) => setSettings(prev => ({ ...prev, theme }))}
        onClearData={handleClearData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />
    </div>
  )
}