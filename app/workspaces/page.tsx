"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import Float from "@/fancy/blocks/float"
import SimpleCarousel from "@/fancy/blocks/simple-carousel"
import ScrambleIn from "@/fancy/text/scramble-in"
import BreathingText from "@/fancy/text/breathing-text"
import { Button } from "@/ui/button"
import { Card } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Input } from "@/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/tabs"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog"
import { Calendar } from "@/ui/calendar"
import {
  Sparkles,
  Plus,
  Search,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Link as LinkIcon,
  BarChart3,
  Clock,
  Target,
  ArrowRight,
  MoreVertical,
  Edit,
  Trash,
  Copy,
  Star,
  Folder,
  Grid3x3,
  List,
  Filter,
  SortAsc
} from "lucide-react"

interface Workspace {
  id: string
  title: string
  organization: string
  modules: number
  lastUpdated: string
  color: string
  stats: {
    ambassadors: number
    links: number
    clicks: number
  }
  starred?: boolean
}

export default function WorkspacesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = useState(false)

  const workspaces: Workspace[] = [
    {
      id: "1",
      title: "Modern Amenities GTM Strategy",
      organization: "Modern Amenities",
      modules: 5,
      lastUpdated: "2 hours ago",
      color: "purple",
      stats: { ambassadors: 24, links: 48, clicks: 1243 },
      starred: true,
    },
    {
      id: "2",
      title: "Campus Expansion Q1 2025",
      organization: "Stanford University",
      modules: 8,
      lastUpdated: "1 day ago",
      color: "blue",
      stats: { ambassadors: 42, links: 89, clicks: 3421 },
    },
    {
      id: "3",
      title: "YC Startup Marketing",
      organization: "Y Combinator",
      modules: 12,
      lastUpdated: "3 days ago",
      color: "green",
      stats: { ambassadors: 18, links: 34, clicks: 892 },
      starred: true,
    },
    {
      id: "4",
      title: "Berkeley Tech Ambassadors",
      organization: "UC Berkeley",
      modules: 6,
      lastUpdated: "1 week ago",
      color: "orange",
      stats: { ambassadors: 36, links: 67, clicks: 2156 },
    },
  ]

  const recentActivity = [
    {
      id: "1",
      action: "New ambassador added",
      workspace: "Modern Amenities GTM Strategy",
      time: "10 minutes ago",
      icon: Users,
      color: "blue",
    },
    {
      id: "2",
      action: "Tracking link created",
      workspace: "Campus Expansion Q1 2025",
      time: "1 hour ago",
      icon: LinkIcon,
      color: "purple",
    },
    {
      id: "3",
      action: "Strategy module completed",
      workspace: "YC Startup Marketing",
      time: "3 hours ago",
      icon: Target,
      color: "green",
    },
    {
      id: "4",
      action: "Analytics report generated",
      workspace: "Berkeley Tech Ambassadors",
      time: "5 hours ago",
      icon: BarChart3,
      color: "orange",
    },
  ]

  const upcomingEvents = [
    {
      id: "1",
      title: "Campus Ambassador Training",
      date: "Tomorrow, 2:00 PM",
      workspace: "Modern Amenities",
      attendees: 24,
    },
    {
      id: "2",
      title: "Q1 Strategy Review",
      date: "Jan 25, 10:00 AM",
      workspace: "Stanford",
      attendees: 12,
    },
    {
      id: "3",
      title: "Link Performance Analysis",
      date: "Jan 27, 3:00 PM",
      workspace: "YC Startup",
      attendees: 8,
    },
  ]

  const colorGradients: Record<string, string> = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-red-500",
  }

  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.organization.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Link href="/ambassadors">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Ambassadors
              </Button>
            </Link>
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Strategy
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
            <h1 className="text-5xl font-black mb-4">
              <BreathingText text="Your Workspaces" />
            </h1>
            <p className="text-xl text-gray-400">
              <ScrambleIn delay={500}>
                Manage all your GTM strategies and ambassador programs
              </ScrambleIn>
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white">
                <SortAsc className="w-4 h-4 mr-2" />
                Sort
              </Button>
              <div className="flex items-center gap-1 ml-2 p-1 bg-white/5 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="all">All Workspaces</TabsTrigger>
              <TabsTrigger value="starred">
                <Star className="w-4 h-4 mr-2" />
                Starred
              </TabsTrigger>
              <TabsTrigger value="recent">
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Workspaces Grid/List */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                      {filteredWorkspaces.length} Workspaces
                    </h2>
                    <Dialog open={showNewWorkspaceDialog} onOpenChange={setShowNewWorkspaceDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Workspace
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-white/10 text-white">
                        <DialogHeader>
                          <DialogTitle>Create New Workspace</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Set up a new GTM strategy workspace for your organization
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Workspace Name</label>
                            <Input
                              placeholder="e.g., Q1 Campus Expansion"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Organization</label>
                            <Input
                              placeholder="e.g., Stanford University"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Color Theme</label>
                            <div className="flex gap-2">
                              {Object.entries(colorGradients).map(([color, gradient]) => (
                                <button
                                  key={color}
                                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} hover:scale-110 transition-transform`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => setShowNewWorkspaceDialog(false)}
                            className="text-gray-400"
                          >
                            Cancel
                          </Button>
                          <Link href="/chat">
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                              Create & Generate Strategy
                            </Button>
                          </Link>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredWorkspaces.map((workspace, index) => (
                        <motion.div
                          key={workspace.id}
                          initial={{ y: 40, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <Float speed={2 + index * 0.2} rotationIntensity={0.1} floatIntensity={0.3}>
                            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                              <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorGradients[workspace.color]} flex items-center justify-center`}>
                                    <Folder className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {workspace.starred && (
                                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    )}
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                <h3 className="text-lg font-bold mb-2 group-hover:text-purple-300 transition-colors">
                                  {workspace.title}
                                </h3>
                                <p className="text-sm text-gray-400 mb-4">{workspace.organization}</p>

                                <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Folder className="w-4 h-4" />
                                    {workspace.modules} modules
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {workspace.lastUpdated}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                                  <div className="text-center">
                                    <div className="text-lg font-bold">{workspace.stats.ambassadors}</div>
                                    <div className="text-xs text-gray-400">Ambassadors</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-bold">{workspace.stats.links}</div>
                                    <div className="text-xs text-gray-400">Links</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-bold">{workspace.stats.clicks}</div>
                                    <div className="text-xs text-gray-400">Clicks</div>
                                  </div>
                                </div>

                                <Link href={`/workspaces/${workspace.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-4 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                  >
                                    Open Workspace
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                  </Button>
                                </Link>
                              </div>
                            </Card>
                          </Float>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredWorkspaces.map((workspace, index) => (
                        <motion.div
                          key={workspace.id}
                          initial={{ x: -40, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                            <div className="p-6 flex items-center gap-6">
                              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorGradients[workspace.color]} flex items-center justify-center flex-shrink-0`}>
                                <Folder className="w-8 h-8 text-white" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-xl font-bold group-hover:text-purple-300 transition-colors">
                                    {workspace.title}
                                  </h3>
                                  {workspace.starred && (
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-400">{workspace.organization}</p>
                              </div>

                              <div className="flex items-center gap-8 text-sm">
                                <div className="text-center">
                                  <div className="text-lg font-bold">{workspace.stats.ambassadors}</div>
                                  <div className="text-gray-400">Ambassadors</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold">{workspace.stats.links}</div>
                                  <div className="text-gray-400">Links</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold">{workspace.stats.clicks}</div>
                                  <div className="text-gray-400">Clicks</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link href={`/workspaces/${workspace.id}`}>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                                  >
                                    Open
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Calendar */}
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CalendarIcon className="w-5 h-5 text-purple-400" />
                        <h3 className="font-bold">Calendar</h3>
                      </div>
                      <div className="[&_button]:text-white [&_.rdp-day_selected]:bg-purple-600 [&_.rdp-day_selected]:text-white">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md"
                        />
                      </div>
                    </Card>
                  </motion.div>

                  {/* Upcoming Events */}
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold">Upcoming Events</h3>
                      </div>
                      <div className="space-y-3">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                            <p className="text-xs text-gray-400 mb-2">{event.date}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">{event.workspace}</span>
                              <div className="flex items-center gap-1 text-purple-400">
                                <Users className="w-3 h-3" />
                                {event.attendees}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <h3 className="font-bold">Recent Activity</h3>
                      </div>
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${activity.color}-500 to-${activity.color}-600 flex items-center justify-center flex-shrink-0`}>
                              <activity.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium mb-1">{activity.action}</p>
                              <p className="text-xs text-gray-400 truncate">{activity.workspace}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="starred">
              <div className="text-center py-20">
                <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Starred Workspaces</h3>
                <p className="text-gray-400">Your favorite workspaces will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <div className="text-center py-20">
                <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Recently Accessed</h3>
                <p className="text-gray-400">Workspaces you've visited recently will show here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
