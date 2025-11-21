"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "motion/react"
import AnimatedGradientWithSvg from "@/fancy/background/animated-gradient-with-svg"
import PixelTrail from "@/fancy/background/pixel-trail"
import Float from "@/fancy/blocks/float"
import StackingCards from "@/fancy/blocks/stacking-cards"
import ScrambleHover from "@/fancy/text/scramble-hover"
import ScrambleIn from "@/fancy/text/scramble-in"
import Letter3DSwap from "@/fancy/text/letter-3d-swap"
import BasicNumberTicker from "@/fancy/text/basic-number-ticker"
import TextCursorProximity from "@/fancy/text/text-cursor-proximity"
import ParallaxFloating from "@/fancy/image/parallax-floating"
import { CursorAttractorAndGravity } from "@/fancy/physics/cursor-attractor-and-gravity"
import { Button } from "@/ui/button"
import { Card } from "@/ui/card"
import { Badge } from "@/ui/badge"
import {
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Users,
  Link as LinkIcon,
  BarChart3,
  Brain,
  Rocket,
  Shield,
  Globe,
  Calendar,
  MessageSquare,
  ChevronRight
} from "lucide-react"

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const stats = [
    { label: "Total Clicks", value: 12543, icon: BarChart3 },
    { label: "Active Ambassadors", value: 48, icon: Users },
    { label: "Tracking Links", value: 156, icon: LinkIcon },
    { label: "Conversions", value: 892, icon: Target },
  ]

  const features = [
    {
      icon: Brain,
      title: "AI Strategy Generation",
      description: "Generate comprehensive GTM strategies in seconds using Claude, GPT-4, and Gemini. Get instant answers to complex marketing questions.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Ambassador Management",
      description: "Design multi-tier student ambassador programs with built-in tracking, analytics, and performance metrics.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track every click, signup, and conversion with powerful analytics. Know exactly what's working and what's not.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Instant Execution",
      description: "From strategy to action with one click. Auto-generate content, tracking links, and campaign materials instantly.",
      gradient: "from-orange-500 to-red-500",
    },
  ]

  const testimonials = [
    {
      quote: "Campus GTM transformed our ambassador program. We 10x'd our signups in the first semester.",
      author: "Sarah Chen",
      role: "Community Lead @ Stanford",
      avatar: "🎓",
    },
    {
      quote: "The AI strategy generation is insane. What used to take days now takes minutes.",
      author: "Marcus Rodriguez",
      role: "Marketing Director @ MIT",
      avatar: "🚀",
    },
    {
      quote: "Finally, a tool that understands campus marketing. The analytics are game-changing.",
      author: "Priya Patel",
      role: "Growth Lead @ Berkeley",
      avatar: "⚡",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <AnimatedGradientWithSvg
          colors={["#6366f1", "#8b5cf6", "#ec4899", "#f97316"]}
          speed={0.5}
          opacity={0.3}
        />
      </div>

      {/* Pixel Trail Effect */}
      <PixelTrail pixelSize={8} trailLength={20} />

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">
              <ScrambleHover text="Campus GTM" scrambleSpeed={30} />
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/chat" className="text-sm hover:text-purple-400 transition-colors">
              Chat
            </Link>
            <Link href="/workspaces" className="text-sm hover:text-purple-400 transition-colors">
              Workspaces
            </Link>
            <Link href="/ambassadors" className="text-sm hover:text-purple-400 transition-colors">
              Ambassadors
            </Link>
            <CursorAttractorAndGravity attractorSize={100} force={0.3}>
              <Button
                variant="default"
                size="md"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                Get Started
              </Button>
            </CursorAttractorAndGravity>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative z-10 pt-32 pb-20 px-6"
        style={{ y, opacity }}
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <Badge className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              AI-Powered Campus Marketing
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-7xl md:text-8xl font-black mb-6 leading-tight"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="block">
              <Letter3DSwap
                text="Your AI-Powered"
                className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
              />
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              <TextCursorProximity
                text="GTM Copilot"
                radius={200}
                force={20}
                ease="easeOut"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <ScrambleIn delay={1000}>
              The Notion for Go-To-Market. Automate your Student Ambassador program with AI-powered strategies.
            </ScrambleIn>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <CursorAttractorAndGravity attractorSize={120} force={0.4}>
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 text-lg px-8 py-6 group"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CursorAttractorAndGravity>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/20 hover:border-white/40 bg-white/5 backdrop-blur-sm text-white text-lg px-8 py-6"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book a Demo
            </Button>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => (
              <Float
                key={stat.label}
                speed={2 + index * 0.5}
                rotationIntensity={0.2}
                floatIntensity={0.5}
              >
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-white">
                      <BasicNumberTicker value={stat.value} duration={2000} />
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </Card>
              </Float>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section with Stacking Cards */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Everything you need to dominate campus
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built for growth teams, powered by AI, designed for scale
            </p>
          </motion.div>

          <StackingCards cardHeight={400} cardGap={40}>
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 hover:bg-white/10 transition-all duration-500 group"
              >
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-6 text-purple-400 hover:text-purple-300 group/btn"
                    >
                      Learn more
                      <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </StackingCards>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Loved by growth teams
            </h2>
            <p className="text-xl text-gray-400">
              See what campus leaders are saying
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Float speed={2 + index * 0.3} rotationIntensity={0.1}>
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 h-full hover:bg-white/10 transition-all duration-300">
                    <div className="flex flex-col h-full">
                      <p className="text-lg text-gray-300 mb-6 flex-1 leading-relaxed">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-white">{testimonial.author}</div>
                          <div className="text-sm text-gray-400">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Float>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border-2 border-purple-500/30 p-16 text-center overflow-hidden relative">
              {/* Animated background element */}
              <div className="absolute inset-0 opacity-20">
                <ParallaxFloating intensity={20}>
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 blur-3xl" />
                </ParallaxFloating>
              </div>

              <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Ready to dominate your campus?
                </h2>
                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                  Join hundreds of universities using Campus GTM to power their student ambassador programs
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <CursorAttractorAndGravity attractorSize={140} force={0.5}>
                    <Link href="/chat">
                      <Button
                        size="lg"
                        className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-10 py-7 group"
                      >
                        <Rocket className="w-6 h-6 mr-2" />
                        Start Free Trial
                        <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CursorAttractorAndGravity>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 hover:border-white/50 bg-white/10 backdrop-blur-sm text-white font-bold text-lg px-10 py-7"
                  >
                    <MessageSquare className="w-6 h-6 mr-2" />
                    Talk to Sales
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-xl py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold">Campus GTM</span>
              </div>
              <p className="text-sm text-gray-400">
                The AI-powered platform for campus marketing teams
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link></li>
                <li><Link href="/workspaces" className="hover:text-white transition-colors">Workspaces</Link></li>
                <li><Link href="/ambassadors" className="hover:text-white transition-colors">Ambassadors</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2025 Campus GTM. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Powered by Google Gemini AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
