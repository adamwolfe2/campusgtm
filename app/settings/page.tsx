"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { AIProviderSettings } from "@/components/ai-provider-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Sparkles, User, Bell } from "lucide-react";

export default function SettingsPage() {
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
              Manage your AI providers and preferences
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b">
          <button className="border-b-2 border-primary px-4 py-2 font-medium text-primary">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Providers
            </div>
          </button>
          <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </div>
          </button>
          <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </div>
          </button>
        </div>

        {/* AI Provider Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AIProviderSettings
            onSave={(configs) => {
              console.log("Saved configurations:", configs);
            }}
          />
        </motion.div>

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
      </div>
    </DashboardLayout>
  );
}
