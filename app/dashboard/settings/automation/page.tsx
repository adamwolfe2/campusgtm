"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Clock,
  Mail,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Plus,
  Search,
  Trophy,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  getAutomationPreferences,
  updateAutomationPreferences,
  getScheduledMonitors,
  getAutomationLogs,
  deleteScheduledMonitor,
  toggleMonitor,
  type AutomationPreferences,
  type ScheduledMonitor,
  type AutomationLog,
} from "@/app/actions/automation-settings";

/**
 * Automation Settings Page
 * Manage email preferences, monitoring schedules, and view automation logs
 */
export default function AutomationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState<AutomationPreferences>({
    workspaceId: "default", // TODO: Get from auth context
    enableDailyDigest: false,
    enableWeeklyDigest: false,
    enableAlerts: true,
    preferredSendTime: "09:00",
    timezone: "UTC",
  });

  // Monitors state
  const [monitors, setMonitors] = useState<ScheduledMonitor[]>([]);

  // Logs state
  const [logs, setLogs] = useState<AutomationLog[]>([]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const workspaceId = "default"; // TODO: Get from auth context

      // Load preferences
      const prefs = await getAutomationPreferences(workspaceId);
      if (prefs) {
        setPreferences(prefs);
      }

      // Load monitors
      const monitorsData = await getScheduledMonitors(workspaceId);
      setMonitors(monitorsData);

      // Load logs
      const logsData = await getAutomationLogs(workspaceId, 20);
      setLogs(logsData);

    } catch (error) {
      console.error("Load data error:", error);
      toast.error("Failed to load automation settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePreferences() {
    try {
      setSaving(true);
      await updateAutomationPreferences(preferences.workspaceId, preferences);
      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error("Save preferences error:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleMonitor(monitorId: string, isActive: boolean) {
    try {
      await toggleMonitor(monitorId, isActive);
      setMonitors(monitors.map(m =>
        m.id === monitorId ? { ...m, isActive } : m
      ));
      toast.success(`Monitor ${isActive ? 'activated' : 'paused'}`);
    } catch (error) {
      console.error("Toggle monitor error:", error);
      toast.error("Failed to toggle monitor");
    }
  }

  async function handleDeleteMonitor(monitorId: string) {
    if (!confirm("Are you sure you want to delete this monitor?")) {
      return;
    }

    try {
      await deleteScheduledMonitor(monitorId);
      setMonitors(monitors.filter(m => m.id !== monitorId));
      toast.success("Monitor deleted");
    } catch (error) {
      console.error("Delete monitor error:", error);
      toast.error("Failed to delete monitor");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Automation Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Configure scheduled monitoring, email notifications, and automation preferences.
          </p>
        </div>

        {/* Email Preferences Section */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Email Preferences</h2>
          </div>

          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={preferences.email || ""}
                onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                className="max-w-md"
              />
              <p className="text-sm text-muted-foreground">
                Receive automation notifications at this email address.
              </p>
            </div>

            <Separator />

            {/* Daily Digest Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="daily-digest">Daily Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Get a daily summary of new mentions and high-priority actions
                </p>
              </div>
              <Switch
                id="daily-digest"
                checked={preferences.enableDailyDigest}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, enableDailyDigest: checked })
                }
              />
            </div>

            {/* Weekly Digest Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Get a comprehensive weekly report every Monday morning
                </p>
              </div>
              <Switch
                id="weekly-digest"
                checked={preferences.enableWeeklyDigest}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, enableWeeklyDigest: checked })
                }
              />
            </div>

            {/* High-Priority Alerts Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="alerts">High-Priority Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get instant notifications for critical mentions and competitor changes
                </p>
              </div>
              <Switch
                id="alerts"
                checked={preferences.enableAlerts}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, enableAlerts: checked })
                }
              />
            </div>

            <Separator />

            {/* Preferred Send Time */}
            <div className="space-y-2">
              <Label htmlFor="send-time">Preferred Send Time</Label>
              <div className="flex items-center gap-4 max-w-md">
                <Input
                  id="send-time"
                  type="time"
                  value={preferences.preferredSendTime}
                  onChange={(e) =>
                    setPreferences({ ...preferences, preferredSendTime: e.target.value })
                  }
                  className="w-40"
                />
                <Input
                  value={preferences.timezone}
                  onChange={(e) =>
                    setPreferences({ ...preferences, timezone: e.target.value })
                  }
                  placeholder="Timezone (e.g., UTC, America/New_York)"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Daily digest will be sent at this time in your timezone.
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button onClick={handleSavePreferences} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Monitoring Schedules Section */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Monitoring Schedules</h2>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Monitor
            </Button>
          </div>

          {monitors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="mx-auto h-12 w-12 mb-2 opacity-20" />
              <p>No scheduled monitors configured yet.</p>
              <p className="text-sm">Add monitors from the Intelligence pages.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monitors.map((monitor) => (
                <div
                  key={monitor.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {monitor.monitorType === 'keyword' && (
                      <Search className="h-5 w-5 text-blue-500" />
                    )}
                    {monitor.monitorType === 'competitor' && (
                      <Trophy className="h-5 w-5 text-amber-500" />
                    )}
                    {monitor.monitorType === 'community' && (
                      <Target className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium capitalize">
                        {monitor.monitorType.replace('_', ' ')} Monitor
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Runs {monitor.frequency.replace('_', ' ')} •
                        {monitor.lastRunAt ?
                          ` Last run: ${monitor.lastRunAt.toLocaleString()}` :
                          ' Never run'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleMonitor(monitor.id!, !monitor.isActive)}
                    >
                      {monitor.isActive ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMonitor(monitor.id!)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log Section */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Activity Log</h2>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-12 w-12 mb-2 opacity-20" />
              <p>No automation activity yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-4 rounded-lg border"
                >
                  {log.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : log.status === 'failed' ? (
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium capitalize">
                        {log.jobType.replace(/_/g, ' ')}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {log.executedAt.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.summary}
                    </p>
                    {Object.keys(log.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-primary cursor-pointer">
                          View Details
                        </summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
