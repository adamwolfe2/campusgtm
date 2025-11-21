"use client"

import { Menu, Search, Sun, Moon, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface AppTopBarProps {
  onToggleSidebar: () => void
  showSidebarToggle?: boolean
}

export function AppTopBar({
  onToggleSidebar,
  showSidebarToggle = true
}: AppTopBarProps) {
  const [isDark, setIsDark] = useState(false)

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="app-topbar">
      <div className="flex items-center gap-4">
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebar}
            className={cn(
              "md:hidden p-2 rounded-md",
              "hover:bg-[var(--hover-bg)]",
              "transition-colors duration-[var(--duration-fast)]"
            )}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Breadcrumbs - will be dynamic */}
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">
            Campus GTM
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <Input
            type="search"
            placeholder="Search..."
            className={cn(
              "pl-9 w-64 h-9",
              "bg-[var(--background-secondary)]",
              "border-transparent",
              "focus:border-[var(--input-focus)]",
              "focus:bg-[var(--input)]"
            )}
          />
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={cn(
            "p-2 rounded-md",
            "hover:bg-[var(--hover-bg)]",
            "transition-colors duration-[var(--duration-fast)]"
          )}
          title="Toggle dark mode"
        >
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* User menu */}
        <button
          className={cn(
            "p-2 rounded-md",
            "hover:bg-[var(--hover-bg)]",
            "transition-colors duration-[var(--duration-fast)]"
          )}
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
