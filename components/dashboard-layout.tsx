"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { FloatingChatBar } from "@/components/floating-chat-bar";
import { JournalModal } from "@/components/journal-modal";
import { pageVariants } from "@/lib/animation-variants";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

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
      <FloatingChatBar />
      <JournalModal />
    </div>
  );
}
