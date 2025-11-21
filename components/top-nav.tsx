"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { glass } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface TopNavProps {
  className?: string;
  onMobileMenuClick?: () => void;
}

export function TopNav({ className, onMobileMenuClick }: TopNavProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/chat?prompt=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsFocused(false);
    }
  };

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b px-4 md:px-6",
        glass.strong,
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

        {/* Premium Search Bar - Searchables Style */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <div
            className={cn(
              "group relative flex items-center gap-3 rounded-xl border bg-background/50 px-4 py-2.5 transition-all duration-200",
              "hover:bg-background hover:shadow-sm",
              isFocused && "bg-background shadow-sm ring-2 ring-primary/10",
              !isFocused && searchQuery && "bg-background"
            )}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask anything..."
              className={cn(
                "flex-1 bg-transparent text-sm outline-none",
                "placeholder:text-muted-foreground/60",
                "transition-all duration-200"
              )}
              aria-label="Ask anything"
            />
            <button
              type="submit"
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md transition-all",
                "text-muted-foreground/40 group-hover:text-muted-foreground/60",
                (isFocused || searchQuery) && "text-muted-foreground"
              )}
              aria-label="Submit search"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        <UserProfileDropdown />
      </div>
    </header>
  );
}
