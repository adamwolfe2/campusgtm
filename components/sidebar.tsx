"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { sidebarVariants, backdropVariants } from "@/lib/animation-variants";

interface SidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navigationItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Workspaces",
    href: "/workspaces",
    icon: FileText,
  },
  {
    title: "Ambassador Programs",
    href: "/ambassadors",
    icon: Users,
  },
  {
    title: "Content Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Strategy Modules",
    href: "/strategy",
    icon: MessageSquare,
  },
] as const;

export function Sidebar({ className, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Close mobile sidebar on escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        onMobileClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen, onMobileClose]);

  const sidebarContent = (
    <>
      {/* Mobile close button */}
      {isMobileOpen && (
        <div className="flex h-16 items-center justify-end border-b px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="min-h-[44px] min-w-[44px]"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-semibold">Campus GTM</span>
          </motion.div>
        )}
        {isCollapsed && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <Sparkles className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Main navigation">
        <div className="flex flex-col gap-1">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onMobileClose}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 min-h-[44px]",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.title : undefined}
                aria-label={item.title}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span>{item.title}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      <Separator />

      {/* Footer */}
      <div className="flex flex-col gap-2 p-2">
        <Link href="/settings" onClick={onMobileClose}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 min-h-[44px]",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Settings" : undefined}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span>Settings</span>}
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full justify-start gap-3 min-h-[44px] hidden md:flex",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile slide-over sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={onMobileClose}
              className="fixed inset-0 z-[1100] bg-black/50 md:hidden"
              aria-hidden="true"
            />

            {/* Sidebar */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={cn("fixed left-0 top-0 bottom-0 z-[1101] flex w-[280px] flex-col border-r shadow-2xl md:hidden", glass.strong)}
              role="dialog"
              aria-label="Navigation menu"
              aria-modal="true"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={cn(
          "hidden h-screen flex-col border-r bg-card transition-all duration-300 md:flex",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
        aria-label="Navigation menu"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
