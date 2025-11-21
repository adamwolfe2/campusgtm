"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface Workspace {
  id: string
  name: string
  icon: string
}

const workspaces: Workspace[] = [
  { id: "1", name: "Campus GTM", icon: "🚀" },
  { id: "2", name: "Marketing Team", icon: "📱" },
  { id: "3", name: "Personal", icon: "👤" },
]

interface WorkspaceSwitcherProps {
  isCollapsed: boolean
}

export function WorkspaceSwitcher({ isCollapsed }: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto p-2",
            "hover:bg-[var(--hover-bg)]",
            "transition-colors duration-[var(--duration-fast)]"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0 text-lg">
              {selectedWorkspace.icon}
            </div>
            {!isCollapsed && (
              <span className="font-semibold truncate text-sm">
                {selectedWorkspace.name}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-2"
        align="start"
        side="bottom"
      >
        <div className="space-y-1">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => {
                setSelectedWorkspace(workspace)
                setOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                "hover:bg-[var(--hover-bg)] transition-colors",
                "text-sm font-medium text-left",
                workspace.id === selectedWorkspace.id &&
                  "bg-[var(--active-bg)] text-[var(--accent-text)]"
              )}
            >
              <span className="text-xl">{workspace.icon}</span>
              <span className="flex-1 truncate">{workspace.name}</span>
              {workspace.id === selectedWorkspace.id && (
                <Check className="h-4 w-4" />
              )}
            </button>
          ))}

          <div className="border-t border-[var(--border)] mt-2 pt-2">
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                "hover:bg-[var(--hover-bg)] transition-colors",
                "text-sm font-medium text-[var(--text-secondary)]"
              )}
            >
              <Plus className="h-5 w-5" />
              <span>Add workspace</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
