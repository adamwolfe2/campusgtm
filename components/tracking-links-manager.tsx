"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Link as LinkIcon,
  Plus,
  Copy,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  MousePointerClick,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { animations, glass } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface TrackingLink {
  id: string;
  user_id: string;
  ambassador_program_id: string | null;
  short_code: string;
  full_url: string;
  title: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  clicks?: number;
  signups?: number;
  conversionRate?: number;
}

interface TrackingLinksManagerProps {
  ambassadorProgramId?: string;
  showCreateButton?: boolean;
}

export function TrackingLinksManager({
  ambassadorProgramId,
  showCreateButton = true,
}: TrackingLinksManagerProps) {
  const { user } = useUser();
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkDescription, setNewLinkDescription] = useState("");

  useEffect(() => {
    loadLinks();
  }, [user?.id, ambassadorProgramId]);

  const loadLinks = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/tracking-links?userId=${user.id}${
          ambassadorProgramId ? `&ambassadorProgramId=${ambassadorProgramId}` : ""
        }`
      );

      if (!response.ok) {
        throw new Error("Failed to load tracking links");
      }

      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error("Error loading tracking links:", error);
      toast.error("Failed to load tracking links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLink = async () => {
    if (!user?.id || !newLinkUrl.trim()) {
      toast.error("Please provide a URL for the tracking link");
      return;
    }

    try {
      setIsCreating(true);

      const response = await fetch("/api/tracking-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          fullUrl: newLinkUrl,
          title: newLinkTitle || null,
          description: newLinkDescription || null,
          ambassadorProgramId: ambassadorProgramId || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create tracking link");
      }

      const newLink = await response.json();
      setLinks([newLink, ...links]);

      // Reset form
      setNewLinkUrl("");
      setNewLinkTitle("");
      setNewLinkDescription("");
      setIsCreateDialogOpen(false);

      toast.success("Tracking link created successfully!");
    } catch (error) {
      console.error("Error creating tracking link:", error);
      toast.error("Failed to create tracking link");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (linkId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/tracking-links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tracking link");
      }

      setLinks(
        links.map((link) =>
          link.id === linkId ? { ...link, is_active: !isActive } : link
        )
      );

      toast.success(
        isActive ? "Link deactivated" : "Link activated"
      );
    } catch (error) {
      console.error("Error toggling link status:", error);
      toast.error("Failed to update link status");
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this tracking link?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tracking-links/${linkId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tracking link");
      }

      setLinks(links.filter((link) => link.id !== linkId));
      toast.success("Tracking link deleted");
    } catch (error) {
      console.error("Error deleting tracking link:", error);
      toast.error("Failed to delete tracking link");
    }
  };

  const handleCopyLink = (shortCode: string) => {
    const trackingUrl = `${window.location.origin}/t/${shortCode}`;
    navigator.clipboard.writeText(trackingUrl);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tracking Links</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your ambassador tracking links
          </p>
        </div>
        {showCreateButton && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Tracking Link</DialogTitle>
                <DialogDescription>
                  Generate a unique tracking link for your ambassador program
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Destination URL *</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com/signup"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Fall 2024 Campaign"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add notes about this tracking link..."
                    value={newLinkDescription}
                    onChange={(e) => setNewLinkDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateLink} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>Create Link</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Links Grid */}
      {links.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <LinkIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>No Tracking Links Yet</CardTitle>
            <CardDescription>
              Create your first tracking link to start monitoring ambassador signups
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {links.map((link, index) => (
            <motion.div
              key={link.id}
              {...animations.fadeInUp}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(!link.is_active && "opacity-60")}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {link.title || "Untitled Link"}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {link.description || "No description"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(link.id, link.is_active)}
                      className="h-8 w-8"
                    >
                      {link.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Short Link */}
                  <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                    <code className="flex-1 text-xs truncate">
                      /t/{link.short_code}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyLink(link.short_code)}
                      className="h-6 w-6"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <MousePointerClick className="h-3 w-3" />
                        Clicks
                      </div>
                      <div className="text-lg font-bold">
                        {link.clicks || 0}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Signups
                      </div>
                      <div className="text-lg font-bold">
                        {link.signups || 0}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        CVR
                      </div>
                      <div className="text-lg font-bold">
                        {link.conversionRate?.toFixed(1) || 0}%
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() =>
                        window.open(
                          `${window.location.origin}/t/${link.short_code}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
