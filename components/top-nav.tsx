"use client";

import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { cn } from "@/lib/utils";

interface TopNavProps {
  className?: string;
  onMobileMenuClick?: () => void;
}

export function TopNav({ className, onMobileMenuClick }: TopNavProps) {
  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b bg-card px-4 md:px-6",
        className
      )}
      role="banner"
    >
      {/* Mobile menu button + Search */}
      <div className="flex flex-1 items-center gap-2 md:gap-4">
        {/* Hamburger menu for mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuClick}
          className="md:hidden min-h-[44px] min-w-[44px]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search workspaces, strategies..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Search workspaces and strategies"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        <UserProfileDropdown />
      </div>
    </header>
  );
}
