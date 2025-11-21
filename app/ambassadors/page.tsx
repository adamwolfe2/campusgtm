"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import Float from "@/fancy/blocks/float"
import { Button } from "@/ui/button"
import { Card } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Input } from "@/ui/input"
import {
  Sparkles,
  Plus,
  Search,
  Users,
  TrendingUp,
  Link as LinkIcon,
  BarChart3,
  Star,
  Mail,
  Phone,
  Award,
  Target
} from "lucide-react"

export default function AmbassadorsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const ambassadors = [
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah.chen@stanford.edu",
      university: "Stanford University",
      tier: "Campus Leader",
      clicks: 543,
      signups: 87,
      revenue: 4350,
      status: "active",
      avatar: "🎓",
    },
    {
      id: "2",
      name: "Marcus Rodriguez",
      email: "m.rodriguez@mit.edu",
      university: "MIT",
      tier: "Ambassador Captain",
      clicks: 892,
      signups: 124,
      revenue: 6200,
      status: "active",
      avatar: "🚀",
    },
    {
      id: "3",
      name: "Priya Patel",
      email: "priya@berkeley.edu",
      university: "UC Berkeley",
      tier: "Brand Ambassador",
      clicks: 234,
      signups: 34,
      revenue: 1700,
      status: "active",
      avatar: "⚡",
    },
    {
      id: "4",
      name: "Alex Kim",
      email: "alex.kim@yale.edu",
      university: "Yale University",
      tier: "Campus Leader",
      clicks: 678,
      signups: 95,
      revenue: 4750,
      status: "active",
      avatar: "🎯",
    },
  ]

  const tierColors: Record<string, string> = {
    "Campus Leader": "from-purple-500 to-pink-500",
    "Ambassador Captain": "from-blue-500 to-cyan-500",
    "Brand Ambassador": "from-green-500 to-emerald-500",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Campus GTM</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/chat">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Chat
              </Button>
            </Link>
            <Link href="/workspaces">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Workspaces
              </Button>
            </Link>
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Ambassador
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Header */}
      <section className="pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-black mb-4">Ambassador Network</h1>
            <p className="text-xl text-gray-400">
              Manage your campus ambassadors and track their performance
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              { label: "Total Ambassadors", value: 48, icon: Users, color: "purple" },
              { label: "Total Clicks", value: 2347, icon: BarChart3, color: "blue" },
              { label: "Conversions", value: 340, icon: Target, color: "green" },
              { label: "Revenue", value: "$17.2k", icon: TrendingUp, color: "orange" },
            ].map((stat, index) => (
              <Float key={stat.label} speed={2 + index * 0.3} rotationIntensity={0.1}>
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-black">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              </Float>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            className="mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search ambassadors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ambassador Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ambassadors.map((ambassador, index) => (
              <motion.div
                key={ambassador.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Float speed={2 + index * 0.2} rotationIntensity={0.1}>
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                    <div className="p-6">
                      {/* Avatar & Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
                            {ambassador.avatar}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold group-hover:text-purple-300 transition-colors">
                              {ambassador.name}
                            </h3>
                            <p className="text-sm text-gray-400">{ambassador.university}</p>
                          </div>
                        </div>
                        <Badge className={`bg-gradient-to-r ${tierColors[ambassador.tier]} text-white border-0`}>
                          <Star className="w-3 h-3 mr-1" />
                          {ambassador.tier}
                        </Badge>
                      </div>

                      {/* Contact */}
                      <div className="space-y-2 mb-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {ambassador.email}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                          <div className="text-xl font-bold">{ambassador.clicks}</div>
                          <div className="text-xs text-gray-400">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">{ambassador.signups}</div>
                          <div className="text-xs text-gray-400">Signups</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">${(ambassador.revenue / 1000).toFixed(1)}k</div>
                          <div className="text-xs text-gray-400">Revenue</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Links
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Float>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
