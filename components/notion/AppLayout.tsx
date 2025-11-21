"use client"

import { ReactNode, useState } from "react"
import { AppSidebar } from "./AppSidebar"
import { AppTopBar } from "./AppTopBar"

interface AppLayoutProps {
  children: ReactNode
  sidebarContent?: ReactNode
  showSidebar?: boolean
}

export function AppLayout({
  children,
  sidebarContent,
  showSidebar = true
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="app-layout">
      {showSidebar && (
        <AppSidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarContent}
        </AppSidebar>
      )}

      <div className="app-main">
        <AppTopBar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showSidebarToggle={showSidebar}
        />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  )
}
