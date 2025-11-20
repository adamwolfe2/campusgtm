/**
 * Loading Skeleton Components
 * Enterprise-grade loading states for all major UI elements
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { glass } from "@/lib/design-system";
import { cn } from "@/lib/utils";

/**
 * Workspace Card Skeleton
 * Used on /workspaces page
 */
export function WorkspaceCardSkeleton() {
  return (
    <Card className={cn(glass.card, "hover:shadow-xl transition-shadow")}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Title */}
            <Skeleton className="h-6 w-3/4" />
            {/* Subtitle */}
            <Skeleton className="h-4 w-1/2" />
          </div>
          {/* Icon/Logo */}
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Description lines */}
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />

          {/* Footer stats */}
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid of Workspace Card Skeletons
 */
export function WorkspaceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <WorkspaceCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Module Card Skeleton
 * Used for strategy modules
 */
export function ModuleCardSkeleton() {
  return (
    <Card className={cn(glass.card)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {/* Icon */}
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            {/* Title */}
            <Skeleton className="h-5 w-2/3" />
            {/* Category */}
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * List of Module Skeletons
 */
export function ModuleListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ModuleCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Dashboard Stats Skeleton
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className={cn(glass.card)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * List Item Skeleton
 * Generic list item for tables, lists, etc.
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-white/20 dark:border-gray-700/30 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Page Content Skeleton
 * Full page loading state with header and content
 */
export function PageContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Chat Message Skeleton
 */
export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Editor Content Skeleton
 */
export function EditorSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-10 w-2/3" /> {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <Skeleton className="h-6 w-1/2" /> {/* Subheading */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
