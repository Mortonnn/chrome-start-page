"use client"

import { useState } from "react"
import { X, Search, Save, Palette, Database, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SearchEngine = "google" | "bing" | "duckduckgo" | "yahoo"
type Theme = "light" | "dark" | "system"

const SEARCH_ENGINES = [
  { id: "google", name: "Google", icon: "G" },
  { id: "bing", name: "Bing", icon: "B" },
  { id: "duckduckgo", name: "DuckDuckGo", icon: "DDG" },
  { id: "yahoo", name: "Yahoo", icon: "Y" },
]

const THEMES = [
  { id: "system", name: "System", icon: "💻" },
  { id: "light", name: "Light", icon: "☀️" },
  { id: "dark", name: "Dark", icon: "🌙" },
]

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  searchEngine: SearchEngine
  onSearchEngineChange: (engine: SearchEngine) => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onClearData: () => void
  onExportData: () => void
  onImportData: (file: File) => void
}

export function SettingsModal({
  isOpen,
  onClose,
  searchEngine,
  onSearchEngineChange,
  theme,
  onThemeChange,
  onClearData,
  onExportData,
  onImportData,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "data">("general")
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImportFile(e.target.files[0])
    }
  }

  const confirmImport = () => {
    if (importFile) {
      onImportData(importFile)
      setImportFile(null)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden bg-card border border-border rounded-2xl shadow-2xl animate-scale-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card/95 backdrop-blur z-10">
          <CardTitle id="settings-title" className="text-lg">
            Settings
          </CardTitle>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-border p-4 gap-1 overflow-x-auto">
          {[
            { id: "general", label: "General", icon: Search },
            { id: "appearance", label: "Appearance", icon: Palette },
            { id: "data", label: "Data", icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Default Search Engine</CardTitle>
                  <CardDescription className="text-xs">
                    Choose which search engine to use for searches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={searchEngine} onValueChange={onSearchEngineChange}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select engine" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEARCH_ENGINES.map((engine) => (
                        <SelectItem key={engine.id} value={engine.id} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                            {engine.icon}
                          </span>
                          {engine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Theme</CardTitle>
                  <CardDescription className="text-xs">
                    Choose your preferred color theme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={theme} onValueChange={onThemeChange}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {THEMES.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="flex items-center gap-2">
                          <span className="text-lg">{t.icon}</span>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-6">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-base text-destructive flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-xs">
                    These actions are irreversible
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
                    <div>
                      <p className="font-medium text-destructive">Clear All Data</p>
                      <p className="text-sm text-muted-foreground">
                        Remove all shortcuts and settings
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                          onClearData()
                        }
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Export Data</CardTitle>
                  <CardDescription className="text-xs">
                    Download your shortcuts and settings as JSON
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={onExportData} className="w-full max-w-xs">
                    <Save className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Import Data</CardTitle>
                  <CardDescription className="text-xs">
                    Import shortcuts and settings from a JSON file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="sr-only"
                    id="import-file"
                    ref={(el) => el?.click()}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("import-file")?.click()}
                    className="w-full max-w-xs"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  {importFile && (
                    <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <span className="text-sm truncate max-w-[200px]">{importFile.name}</span>
                      <Button size="sm" onClick={confirmImport}>
                        Import
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}