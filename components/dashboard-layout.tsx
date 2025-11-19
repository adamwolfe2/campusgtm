"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto bg-background p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
