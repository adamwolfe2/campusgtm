"use client"

import { ReactNode } from "react"
import Link from "next/link"
import {
  Home,
  MessageSquare,
  Users,
  Link as LinkIcon,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  children?: ReactNode
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Ambassadors", href: "/ambassadors", icon: Users },
  { name: "Tracking Links", href: "/tracking-links", icon: LinkIcon },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar({
  children,
  isOpen,
  isCollapsed,
  onToggleCollapse
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "app-sidebar",
        isCollapsed && "app-sidebar-collapsed",
        !isOpen && "app-sidebar-closed"
      )}
    >
      {/* Workspace Switcher */}
      <div className="p-3 border-b border-[var(--border)]">
        <WorkspaceSwitcher isCollapsed={isCollapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "notion-sidebar-item",
              "group"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="truncate">{item.name}</span>
            )}
          </Link>
        ))}

        {children}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-[var(--border)]">
        <button
          onClick={onToggleCollapse}
          className="notion-sidebar-item w-full"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
