"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Sparkles, FileText, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "strategy" | "workspace" | "team" | "system";
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Strategy Generated",
    message: "Your GTM strategy for Acme Corp has been generated successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    type: "strategy",
  },
  {
    id: "2",
    title: "Workspace Created",
    message: "New workspace 'Acme Corp GTM Strategy' has been created",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    type: "workspace",
  },
  {
    id: "3",
    title: "Welcome to Campus GTM",
    message: "Get started by creating your first GTM strategy workspace",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    type: "system",
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "strategy":
      return <Sparkles className="h-4 w-4 text-primary" />;
    case "workspace":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "team":
      return <Users className="h-4 w-4 text-green-500" />;
    case "system":
      return <Settings className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative min-h-[44px] min-w-[44px]"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:text-primary hover:bg-transparent"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex cursor-pointer flex-col items-start gap-2 p-4",
                  !notification.read && "bg-primary/5"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm leading-snug">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
