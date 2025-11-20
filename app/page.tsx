"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Users, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container flex flex-col items-center gap-8 px-4 py-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
        >
          <Sparkles className="h-10 w-10" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-4xl font-bold tracking-tight sm:text-6xl"
        >
          Campus GTM
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl text-center text-xl text-muted-foreground"
        >
          The Notion for Go-To-Market. Automate your Student Ambassador program
          with AI-powered strategies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4"
        >
          <Button size="lg" className="gap-2" asChild>
            <Link href="/sign-up">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Ambassador Programs"
            description="Design multi-tier student ambassador structures"
            delay={0.7}
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="GTM Strategy"
            description="AI-generated go-to-market plans in seconds"
            delay={0.8}
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Instant Execution"
            description="From strategy to action with one click"
            delay={0.9}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          Powered by Google Gemini AI
        </motion.div>
      </motion.div>
    </main>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center transition-colors hover:bg-accent"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}
