"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import type { OnboardingData } from "@/types/onboarding";
import { Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleComplete = async (data: OnboardingData) => {
    setIsGenerating(true);

    // Store onboarding data in localStorage for now
    localStorage.setItem("onboarding-data", JSON.stringify(data));

    // In a real app, this would:
    // 1. Send data to server
    // 2. Trigger AI strategy generation
    // 3. Create workspace
    // 4. Redirect to dashboard with generated strategy

    // Simulate API call
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
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

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Takes about 3-5 minutes
        </p>
      </motion.div>
    </main>
  );
}
