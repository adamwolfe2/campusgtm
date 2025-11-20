"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { animations, glass } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export function FloatingChatButton() {
  const router = useRouter();

  return (
    <motion.div
      {...animations.scaleIn}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <Button
        onClick={() => router.push('/chat')}
        size="lg"
        className={cn(
          "group gap-3 px-6 py-6 shadow-2xl",
          glass.strong,
          "border-2 border-primary/20",
          "hover:border-primary/40 hover:shadow-primary/20",
          "transition-all duration-300"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">Start new chat</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Button>
    </motion.div>
  );
}
