"use client"

import { useRef, useState } from "react"
import { X, Search, Save, Palette, Database, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SearchEngine = "google" | "bing" | "duckduckgo" | "yahoo"
type Theme = "light" | "dark" | "system"

const SEARCH_ENGINES = [
  { id: "google", name: "Google", badge: "G", badgeClass: "bg-[#4285F4] text-white" },
  { id: "bing", name: "Bing", badge: "B", badgeClass: "bg-[#0c8484] text-white" },
  { id: "duckduckgo", name: "DuckDuckGo", badge: "D", badgeClass: "bg-[#de5833] text-white" },
  { id: "yahoo", name: "Yahoo", badge: "Y", badgeClass: "bg-[#6001d2] text-white" },
]

const THEMES = [
  { id: "system", name: "跟随系统" },
  { id: "light", name: "浅色" },
  { id: "dark", name: "深色" },
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImportFile(e.target.files[0])
    }
  }

  const confirmImport = () => {
    if (importFile) {
      onImportData(importFile)
      setImportFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="relative flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
          <CardTitle id="settings-title" className="text-lg">
            设置
          </CardTitle>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="关闭设置"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-border p-3">
          {[
            { id: "general", label: "搜索", icon: Search },
            { id: "appearance", label: "外观", icon: Palette },
            { id: "data", label: "数据", icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-card p-5">
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">默认搜索引擎</CardTitle>
                <CardDescription className="text-xs">
                  选择搜索框默认使用的搜索引擎，可随时切换 Google 或 Bing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={searchEngine} onValueChange={(value) => onSearchEngineChange(value as SearchEngine)}>
                  <SelectTrigger className="w-full max-w-xs bg-background">
                    <SelectValue placeholder="选择搜索引擎" />
                  </SelectTrigger>
                  <SelectContent>
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
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">主题</CardTitle>
                <CardDescription className="text-xs">
                  选择浅色、深色，或者跟随系统
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={theme} onValueChange={(value) => onThemeChange(value as Theme)}>
                  <SelectTrigger className="w-full max-w-xs bg-background">
                    <SelectValue placeholder="选择主题" />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {activeTab === "data" && (
            <div className="space-y-5">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-destructive">
                    <Trash2 className="h-4 w-4" />
                    清空数据
                  </CardTitle>
                  <CardDescription className="text-xs">
                    将删除全部快捷方式和设置，且不可恢复
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-background p-4">
                    <p className="text-sm text-muted-foreground">
                      建议先导出备份，再清空数据
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm("确定要清空全部快捷方式和设置吗？")) {
                          onClearData()
                        }
                      }}
                    >
                      清空
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">导出数据</CardTitle>
                  <CardDescription className="text-xs">
                    把快捷方式和设置下载为 JSON 备份文件
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={onExportData} className="w-full max-w-xs bg-background">
                    <Save className="mr-2 h-4 w-4" />
                    导出备份
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">导入数据</CardTitle>
                  <CardDescription className="text-xs">
                    从 JSON 备份文件恢复快捷方式和设置
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImport}
                    className="sr-only"
                    id="import-file"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-xs bg-background"
                  >
                    选择备份文件
                  </Button>
                  {importFile && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
                      <span className="max-w-[220px] truncate text-sm">{importFile.name}</span>
                      <Button size="sm" onClick={confirmImport}>
                        导入
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
