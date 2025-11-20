"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmailSubjectLineTab } from "./components/EmailSubjectLineTab";
import { SocialPostsTab } from "./components/SocialPostsTab";
import { OutreachScriptsTab } from "./components/OutreachScriptsTab";
import { HooksTab } from "./components/HooksTab";

export default function ContentGeneratorsPage() {
  const [activeTab, setActiveTab] = useState("subject-lines");

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">AI Content Generators</h1>
        </div>
        <p className="text-muted-foreground">
          Professional-grade content tools powered by AI. Generate email subject lines,
          social posts, outreach scripts, and viral hooks in seconds.
        </p>
      </motion.div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="subject-lines">Email Subject Lines</TabsTrigger>
          <TabsTrigger value="social-posts">Social Posts</TabsTrigger>
          <TabsTrigger value="outreach">Outreach Scripts</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
        </TabsList>

        <TabsContent value="subject-lines">
          <EmailSubjectLineTab />
        </TabsContent>

        <TabsContent value="social-posts">
          <SocialPostsTab />
        </TabsContent>

        <TabsContent value="outreach">
          <OutreachScriptsTab />
        </TabsContent>

        <TabsContent value="hooks">
          <HooksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
