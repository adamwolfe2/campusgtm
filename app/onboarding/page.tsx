"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import type { OnboardingData } from "@/types/onboarding";
import { Sparkles, AlertCircle } from "lucide-react";
import { generateCompleteStrategy } from "@/lib/generation/strategy-orchestrator";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>();

  const handleComplete = async (data: OnboardingData) => {
    setIsGenerating(true);
    setError(undefined);

    try {
      // Generate complete GTM strategy using AI
      const result = await generateCompleteStrategy(data);

      // Success! Redirect to workspace
      toast.success("Your GTM strategy has been generated!");
      router.push(`/workspace/${result.workspace.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate strategy";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          >
            <Sparkles className="h-8 w-8" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight">
            Let's build your GTM strategy
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Tell us about your company and we'll create a personalized
            ambassador program and content calendar
          </p>
        </div>

        {/* Onboarding Flow */}
        <div className="rounded-2xl border bg-card p-8 shadow-lg sm:p-12">
          <OnboardingFlow onComplete={handleComplete} />
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4"
          >
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Generation Failed</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Takes about 3-5 minutes
        </p>
      </motion.div>
    </main>
  );
}
