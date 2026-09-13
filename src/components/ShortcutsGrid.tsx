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

export function ShortcutsGrid({
  shortcuts,
  onAddShortcut,
  onEditShortcut,
  onDeleteShortcut,
  isEditing,
}: ShortcutsGridProps) {
  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    } catch {
      return "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔗</text></svg>"
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 w-full">
        {shortcuts.map((shortcut) => (
          <ShortcutCard
            key={shortcut.id}
            shortcut={shortcut}
            faviconUrl={getFaviconUrl(shortcut.url)}
            onEdit={() => onEditShortcut(shortcut)}
            onDelete={() => onDeleteShortcut(shortcut.id)}
            isEditing={isEditing}
          />
        ))}
        <AddShortcutCard onClick={onAddShortcut} />
      </div>
    </div>
  )
}

interface ShortcutCardProps {
  shortcut: Shortcut
  faviconUrl: string
  onEdit: () => void
  onDelete: () => void
  isEditing: boolean
}

function ShortcutCard({ shortcut, faviconUrl, onEdit, onDelete, isEditing }: ShortcutCardProps) {
  return (
    <div className="group relative">
      <a
        href={shortcut.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border",
          "transition-all duration-200 hover:shadow-lg hover:border-primary/50",
          "hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isEditing && "opacity-70 ring-2 ring-primary/50"
        )}
      >
        <div className="relative w-14 h-14 rounded-xl bg-background flex items-center justify-center overflow-hidden">
          <img
            src={faviconUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔗</text></svg>"
            }}
          />
          {isEditing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onEdit()
                }}
                className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                aria-label="Edit shortcut"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-red-500/20 transition-colors"
                aria-label="Delete shortcut"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-center truncate w-full px-1" title={shortcut.title}>
          {shortcut.title}
        </span>
      </a>
    </div>
  )
}

function AddShortcutCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-4 rounded-xl bg-card border-2 border-dashed border-border",
        "transition-all duration-200 hover:border-primary/50 hover:bg-accent",
        "hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-label="Add shortcut"
    >
      <div className="relative w-14 h-14 rounded-xl bg-background flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <span className="text-sm font-medium text-muted-foreground">Add shortcut</span>
    </button>
  )
}