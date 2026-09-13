import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Copy, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Shortcut {
  id: string
  title: string
  url: string
  icon?: string
  favicon?: string
}

interface ShortcutsGridProps {
  shortcuts: Shortcut[]
  onAddShortcut: () => void
  onEditShortcut: (shortcut: Shortcut) => void
  onDeleteShortcut: (id: string) => void
  isEditing: boolean
}

interface ContextMenuState {
  x: number
  y: number
  shortcut: Shortcut
}

const MENU_WIDTH = 240
const MENU_HEIGHT = 208

export function ShortcutsGrid({
  shortcuts,
  onAddShortcut,
  onEditShortcut,
  onDeleteShortcut,
  isEditing,
}: ShortcutsGridProps) {
  const [menu, setMenu] = useState<ContextMenuState | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return

    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenu(null)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null)
    }
    const closeOnScroll = () => setMenu(null)

    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", closeOnEscape)
    window.addEventListener("scroll", closeOnScroll, true)
    window.addEventListener("resize", closeOnScroll)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", closeOnEscape)
      window.removeEventListener("scroll", closeOnScroll, true)
      window.removeEventListener("resize", closeOnScroll)
    }
  }, [menu])

  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
    } catch {
      return "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔗</text></svg>"
    }
  }

  const openMenu = (clientX: number, clientY: number, shortcut: Shortcut) => {
    setMenu({
      x: Math.max(8, Math.min(clientX, window.innerWidth - MENU_WIDTH - 8)),
      y: Math.max(8, Math.min(clientY, window.innerHeight - MENU_HEIGHT - 8)),
      shortcut,
    })
  }

  const copyUrl = async (shortcut: Shortcut) => {
    try {
      await navigator.clipboard.writeText(shortcut.url)
    } catch {
      const input = document.createElement("input")
      input.value = shortcut.url
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
    }
    setMenu(null)
  }

  return (
    <div className="flex w-full max-w-[1200px] flex-col items-center px-2 sm:px-4">
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
        {shortcuts.map((shortcut) => (
          <ShortcutCard
            key={shortcut.id}
            shortcut={shortcut}
            faviconUrl={getFaviconUrl(shortcut.url)}
            onEdit={() => onEditShortcut(shortcut)}
            onDelete={() => onDeleteShortcut(shortcut.id)}
            onOpenMenu={openMenu}
            isEditing={isEditing}
          />
        ))}
        <AddShortcutCard onClick={onAddShortcut} />
      </div>

      {menu && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`${menu.shortcut.title} 操作菜单`}
          className="fixed z-[80] w-[240px] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl animate-scale-in"
          style={{ left: menu.x, top: menu.y }}
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{menu.shortcut.title}</p>
            <p className="truncate text-xs text-muted-foreground" title={menu.shortcut.url}>
              {menu.shortcut.url}
            </p>
          </div>
          <div className="p-1.5">
            <MenuButton
              icon={<ExternalLink className="h-4 w-4" />}
              label="在新标签页中打开"
              onClick={() => {
                window.open(menu.shortcut.url, "_blank", "noopener,noreferrer")
                setMenu(null)
              }}
            />
            <MenuButton
              icon={<Pencil className="h-4 w-4" />}
              label="编辑名称和网址"
              onClick={() => {
                setMenu(null)
                onEditShortcut(menu.shortcut)
              }}
            />
            <MenuButton
              icon={<Copy className="h-4 w-4" />}
              label="复制链接"
              onClick={() => copyUrl(menu.shortcut)}
            />
            <MenuButton
              icon={<Trash2 className="h-4 w-4" />}
              label="删除"
              danger
              onClick={() => {
                setMenu(null)
                onDeleteShortcut(menu.shortcut.id)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface ShortcutCardProps {
  shortcut: Shortcut
  faviconUrl: string
  onEdit: () => void
  onDelete: () => void
  onOpenMenu: (x: number, y: number, shortcut: Shortcut) => void
  isEditing: boolean
}

function ShortcutCard({ shortcut, faviconUrl, onEdit, onDelete, onOpenMenu, isEditing }: ShortcutCardProps) {
  return (
    <div
      className="group relative"
      onContextMenu={(event) => {
        event.preventDefault()
        onOpenMenu(event.clientX, event.clientY, shortcut)
      }}
    >
      <a
        href={shortcut.url}
        target="_blank"
        rel="noopener noreferrer"
        title={`${shortcut.title}\n${shortcut.url}\n右键可以编辑`}
        className={cn(
          "flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4",
          "shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isEditing && "ring-2 ring-primary"
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-background">
          <img
            src={faviconUrl}
            alt=""
            loading="lazy"
            className="h-10 w-10 object-contain"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔗</text></svg>"
            }}
          />
        </span>
        <span className="w-full truncate px-1 text-center text-[13px] font-medium" title={shortcut.title}>
          {shortcut.title}
        </span>
      </a>

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          const rect = event.currentTarget.getBoundingClientRect()
          onOpenMenu(rect.left, rect.bottom + 8, shortcut)
        }}
        className="absolute right-1.5 top-1.5 rounded-full border border-border bg-background p-1.5 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
        aria-label={`打开 ${shortcut.title} 的操作菜单`}
        title="右键也可以编辑"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isEditing && (
        <div className="absolute inset-x-2 bottom-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onEdit()
            }}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium shadow-sm hover:bg-accent"
          >
            编辑
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onDelete()
            }}
            className="rounded-full border border-destructive bg-background px-3 py-1 text-xs font-medium text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground"
          >
            删除
          </button>
        </div>
      )}
    </div>
  )
}

function MenuButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent",
        danger ? "text-destructive hover:bg-muted" : "text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function AddShortcutCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card px-2 py-4",
        "min-h-[116px] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-label="添加快捷方式"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted-foreground">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </span>
      <span className="text-[13px] font-medium text-muted-foreground">添加快捷方式</span>
    </button>
  )
}
