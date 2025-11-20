"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import type { OnboardingData } from "@/types/onboarding";
import { Sparkles } from "lucide-react";
import { generateStrategyAction } from "@/app/actions/generate-strategy";
import { AIErrorState } from "@/components/error-state";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastOnboardingData, setLastOnboardingData] = useState<OnboardingData | null>(null);

  const handleComplete = async (data: OnboardingData) => {
    setIsGenerating(true);
    setError(null);
    setLastOnboardingData(data); // Store for retry

    try {
      // Generate complete GTM strategy using AI (via Server Action)
      const result = await generateStrategyAction(data, user?.id);

      // Success! Redirect to workspace
      toast.success("Your GTM strategy has been generated!");
      router.push(`/workspace/${result.workspace.id}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to generate strategy");
      setError(error);
      toast.error(error.message);
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    if (lastOnboardingData) {
      handleComplete(lastOnboardingData);
    }
  };

  const handleGoToSettings = () => {
    router.push("/settings");
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
          {error ? (
            <AIErrorState
              error={error}
              onRetry={handleRetry}
              onGoToSettings={handleGoToSettings}
            />
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Generating Strategy</h2>
                <p className="text-muted-foreground max-w-md">
                  Our AI is analyzing your inputs and crafting a personalized Campus GTM strategy. This usually takes about 30-60 seconds.
                </p>
              </motion.div>
            </div>
          ) : (
            <OnboardingFlow onComplete={handleComplete} />
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Takes about 3-5 minutes
        </p>
      </motion.div>
    </main>
  );
}
