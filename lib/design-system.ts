/**
 * Glass-Morphism Design Utilities
 * Inspired by Searchable.so and Perplexity AI
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Glass-morphism style presets
 */
export const glass = {
  // Main glass effect - for cards, modals, chat bubbles
  card: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg",

  // Strong glass - for floating elements
  strong: "bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/30 dark:border-gray-700/40 shadow-xl",

  // Subtle glass - for backgrounds, sections
  subtle: "bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-white/10 dark:border-gray-700/20 shadow-md",

  // Input glass - for search bars, text inputs
  input: "bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",

  // Hover states
  hover: "hover:bg-white/90 dark:hover:bg-gray-900/90 hover:shadow-xl transition-all duration-300",
};

/**
 * Animation presets for Framer Motion
 */
export const animations = {
  // Fade in from bottom (for cards, sections)
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },

  // Fade in from top (for modals, dropdowns)
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 },
  },

  // Scale in (for floating buttons, chat bubbles)
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: "easeOut" },
  },

  // Slide in from right (for sidebars, panels)
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.3 },
  },

  // Slide in from left
  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3 },
  },

  // Spring animation (for interactive elements)
  spring: {
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

/**
 * Gradient presets
 */
export const gradients = {
  primary: "bg-gradient-to-r from-primary to-primary/80",
  subtle: "bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800",
  glass: "bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40",
};

/**
 * Recommended prompt themes
 */
export const promptThemes = {
  strategy: { icon: "🎯", color: "text-blue-500", bg: "bg-blue-500/10" },
  content: { icon: "✍️", color: "text-purple-500", bg: "bg-purple-500/10" },
  outreach: { icon: "📧", color: "text-green-500", bg: "bg-green-500/10" },
  growth: { icon: "📈", color: "text-orange-500", bg: "bg-orange-500/10" },
  analysis: { icon: "🔍", color: "text-pink-500", bg: "bg-pink-500/10" },
};
