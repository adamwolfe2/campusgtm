"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AIProviderSettings } from "@/components/ai-provider-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Sparkles, User, Bell, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account, AI providers, and preferences
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Providers
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* AI Providers Tab */}
          <TabsContent value="ai" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Default AI Provider Configured</CardTitle>
                  <CardDescription>
                    You're currently using our shared Anthropic Claude API to get started.
                    Add your own API keys below for unlimited usage.
                  </CardDescription>
                </CardHeader>
              </Card>

              <AIProviderSettings
                onSave={() => {
                  toast.success("AI provider settings saved");
                }}
              />

              <Separator />

              {/* Information Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Why Multiple Providers?</CardTitle>
                    <CardDescription>
                      Different AI models excel at different tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 text-sm">
                    <div>
                      <p className="font-medium">Google Gemini</p>
                      <p className="text-muted-foreground">
                        Best for document-heavy strategies with 2M token context window
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Claude (Anthropic)</p>
                      <p className="text-muted-foreground">
                        Superior reasoning and strategic analysis
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">GPT-4 (OpenAI)</p>
                      <p className="text-muted-foreground">
                        Versatile and widely supported, with image generation capabilities
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>
                      Your data stays private and secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p>✓ API keys stored locally in your browser</p>
                    <p>✓ Never transmitted to Campus GTM servers</p>
                    <p>✓ Direct connection to AI providers</p>
                    <p>✓ You maintain full control of your data</p>
                    <p>✓ No data retention by Campus GTM</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      defaultValue={user?.fullName || ""}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email is managed by your authentication provider
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-4">
                    <h4 className="font-medium">Notify me about:</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="strategy-completion">Strategy generation completion</Label>
                        <Switch id="strategy-completion" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="workspace-updates">Workspace updates</Label>
                        <Switch id="workspace-updates" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="team-activity">Team activity</Label>
                        <Switch id="team-activity" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
