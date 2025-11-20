"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { FloatingChatButton } from "@/components/floating-chat-button";
import { JournalModal } from "@/components/journal-modal";
import { CommandPalette } from "@/components/command-palette";
import { getWorkspaces } from "@/lib/database/workspace-service";
import { pageVariants } from "@/lib/animation-variants";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [workspaces, setWorkspaces] = React.useState<Array<{ id: string; name: string; companyName: string }>>([]);
  const [modules, setModules] = React.useState<Array<{ id: string; title: string; workspaceId: string }>>([]);

  // Load workspaces and modules for command palette
  React.useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      try {
        const loadedWorkspaces = await getWorkspaces(user.id);
        setWorkspaces(loadedWorkspaces.map(w => ({
          id: w.id,
          name: w.name,
          companyName: w.companyName
        })));

        // Extract modules from workspaces
        const allModules = loadedWorkspaces.flatMap(w =>
          w.modules.map(m => ({
            id: m.id,
            title: m.title,
            workspaceId: w.id
          }))
        );
        setModules(allModules);
      } catch (error) {
        console.error("Failed to load data for command palette:", error);
      }
    }

    loadData();
  }, [user?.id]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="flex-1 overflow-y-auto bg-background p-4 md:p-6"
          role="main"
        >
          {children}
        </motion.main>
      </div>

      {/* Floating Components */}
      <FloatingChatButton />
      <JournalModal />
      <CommandPalette workspaces={workspaces} modules={modules} />
    </div>
  );
}
