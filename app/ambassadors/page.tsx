"use client"

import { AppLayout } from "@/components/notion/AppLayout"
import { NotionCard } from "@/components/notion/NotionCard"
import { NotionButton } from "@/components/notion/NotionButton"
import BasicNumberTicker from "@/fancy/text/basic-number-ticker"
import UnderlineCenter from "@/fancy/text/underline-center"
import Float from "@/fancy/blocks/float"
import { Users, TrendingUp, Link as LinkIcon, Award, Plus } from "lucide-react"

const topAmbassadors = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "👩",
    clicks: 1247,
    conversions: 89,
    status: "Top Performer",
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "👨",
    clicks: 1103,
    conversions: 76,
    status: "Rising Star",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "👩‍🦱",
    clicks: 987,
    conversions: 64,
    status: "Consistent",
  },
  {
    id: 4,
    name: "David Kim",
    avatar: "👨‍🦰",
    clicks: 854,
    conversions: 52,
    status: "Growing",
  },
]

const recentActivity = [
  { ambassador: "Sarah Johnson", action: "Generated 12 new clicks", time: "2 minutes ago" },
  { ambassador: "Michael Chen", action: "New signup converted", time: "15 minutes ago" },
  { ambassador: "Emily Rodriguez", action: "Shared tracking link", time: "1 hour ago" },
]

export default function AmbassadorsPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <UnderlineCenter>
                <h1 className="text-4xl font-bold">Ambassador Dashboard</h1>
              </UnderlineCenter>
              <p className="text-[var(--text-secondary)] mt-2">
                Track performance and manage your student ambassadors
              </p>
            </div>
            <NotionButton variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
              Add Ambassador
            </NotionButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <NotionCard float floatSpeed={0.2}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--blue-bg)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--blue)]" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  <BasicNumberTicker value={48} duration={1500} />
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Active Ambassadors</div>
              </div>
            </div>
          </NotionCard>

          <NotionCard float floatSpeed={0.3}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--green-bg)] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--green)]" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  <BasicNumberTicker value={12543} duration={2000} />
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Total Clicks</div>
              </div>
            </div>
          </NotionCard>

          <NotionCard float floatSpeed={0.25}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--purple-bg)] flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-[var(--purple)]" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  <BasicNumberTicker value={156} duration={1500} />
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Tracking Links</div>
              </div>
            </div>
          </NotionCard>

          <NotionCard float floatSpeed={0.35}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--orange-bg)] flex items-center justify-center">
                <Award className="w-5 h-5 text-[var(--orange)]" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  <BasicNumberTicker value={892} duration={1800} />
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Conversions</div>
              </div>
            </div>
          </NotionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Performers */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Top Performers</h2>
            <div className="space-y-4">
              {topAmbassadors.map((ambassador, index) => (
                <Float key={ambassador.id} speed={0.2 + index * 0.05}>
                  <NotionCard hover className="cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--interactive)] to-[var(--accent)] flex items-center justify-center text-2xl">
                        {ambassador.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base truncate">
                            {ambassador.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-[var(--success-bg)] text-[var(--success)] text-xs font-medium">
                            {ambassador.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-secondary)]">
                          <span>
                            <BasicNumberTicker value={ambassador.clicks} duration={1000} /> clicks
                          </span>
                          <span>•</span>
                          <span>
                            <BasicNumberTicker value={ambassador.conversions} duration={1000} /> conversions
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[var(--interactive)]">
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  </NotionCard>
                </Float>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
            <NotionCard>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
                    <p className="font-medium text-sm">{activity.ambassador}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      {activity.action}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      {activity.time}
                    </p>
                  </div>
                ))}
              </div>
            </NotionCard>

            <NotionCard className="mt-4 bg-gradient-to-br from-[var(--accent-bg)] to-[var(--blue-bg)] border-none">
              <div className="text-center py-4">
                <Award className="w-8 h-8 text-[var(--interactive)] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Leaderboard</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  View full rankings and achievements
                </p>
                <NotionButton variant="primary" size="sm">
                  View Leaderboard
                </NotionButton>
              </div>
            </NotionCard>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
