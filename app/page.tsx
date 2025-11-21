"use client"

import { AppLayout } from "@/components/notion/AppLayout"
import { NotionCard } from "@/components/notion/NotionCard"
import { NotionButton } from "@/components/notion/NotionButton"
import {
  Sparkles,
  Users,
  Link as LinkIcon,
  BarChart3,
  ArrowRight,
  Zap,
  Target,
  TrendingUp
} from "lucide-react"
import Typewriter from "@/fancy/text/typewriter"
import ScrambleHover from "@/fancy/text/scramble-hover"
import BasicNumberTicker from "@/fancy/text/basic-number-ticker"

export default function HomePage() {
  const stats = [
    { label: "Total Clicks", value: 12543, icon: BarChart3, color: "blue" },
    { label: "Active Ambassadors", value: 48, icon: Users, color: "green" },
    { label: "Tracking Links", value: 156, icon: LinkIcon, color: "purple" },
    { label: "Conversions", value: 892, icon: Target, color: "orange" },
  ]

  const features = [
    {
      icon: "🎯",
      title: "AI-Powered Strategy",
      description: "Generate marketing strategies with cutting-edge AI models from Anthropic, OpenAI, and Google.",
    },
    {
      icon: "👥",
      title: "Ambassador Tracking",
      description: "Track your student ambassadors with powerful analytics and custom short links.",
    },
    {
      icon: "⚡",
      title: "Real-time Updates",
      description: "Google Drive-style auto-refresh keeps your team synchronized in real-time.",
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Deep insights into clicks, signups, and conversion rates across your campus.",
    },
  ]

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent-text)] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Campus Marketing</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 tracking-tight">
            <ScrambleHover text="Campus GTM" scrambleSpeed={50} />
          </h1>

          <div className="text-2xl text-[var(--text-secondary)] mb-8 h-16">
            <Typewriter
              text={[
                "Track your ambassadors",
                "Grow your campus presence",
                "Build your student network",
              ]}
              speed={50}
              loop={true}
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <NotionButton variant="primary" size="lg" leftIcon={<Zap className="w-5 h-5" />}>
              Get Started
            </NotionButton>
            <NotionButton variant="secondary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              View Demo
            </NotionButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, index) => (
            <NotionCard
              key={stat.label}
              float={true}
              floatSpeed={0.2 + index * 0.1}
              className="text-center"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[var(--interactive)]" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--text-primary)]">
                    <BasicNumberTicker value={stat.value} duration={2000} />
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            </NotionCard>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to grow
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <NotionCard
                key={feature.title}
                icon={<span className="text-2xl">{feature.icon}</span>}
                title={feature.title}
                description={feature.description}
                float={true}
                floatSpeed={0.2 + index * 0.05}
                hover={true}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative">
          <NotionCard
            className="bg-gradient-to-br from-[var(--accent-bg)] to-[var(--blue-bg)] border-none text-center py-12"
            hover={false}
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                Ready to transform your campus marketing?
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8">
                Join hundreds of universities using Campus GTM to power their student ambassador programs.
              </p>
              <NotionButton variant="primary" size="lg" leftIcon={<TrendingUp className="w-5 h-5" />}>
                Start Free Trial
              </NotionButton>
            </div>
          </NotionCard>
        </div>
      </div>
    </AppLayout>
  )
}
