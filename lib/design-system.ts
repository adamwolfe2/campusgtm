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
 * Glass-morphism style presets with consistent shadows
 */
export const glass = {
  // Main glass effect - for cards, modals, chat bubbles
  card: "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg",

  // Strong glass - for floating elements (modals, chat, journal, sidebar, nav)
  strong: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/30 dark:border-gray-700/40 shadow-2xl",

  // Subtle glass - for backgrounds, sections
  subtle: "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/10 dark:border-gray-700/20 shadow-md",

  // Input glass - for search bars, text inputs
  input: "bg-white/85 dark:bg-gray-900/85 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",

  // Hover states
  hover: "hover:bg-white/95 dark:hover:bg-gray-900/95 hover:shadow-2xl transition-all duration-300",
};

/**
 * Shadow system - consistent elevation hierarchy
 */
export const shadows = {
  // Subtle elements (inputs, subtle buttons)
  sm: "shadow-sm",

  // Standard elements (buttons, small cards)
  md: "shadow-md",

  // Cards and panels (default card elevation)
  lg: "shadow-lg",

  // Prominent cards (hover states, important cards)
  xl: "shadow-xl",

  // Floating elements (modals, dropdowns, tooltips, floating bars)
  "2xl": "shadow-2xl",

  // No shadow
  none: "shadow-none",
};

/**
 * Border radius system - consistent rounding
 */
export const radius = {
  // Small elements (buttons, inputs, tags)
  sm: "rounded-md", // 6px

  // Standard elements (buttons, inputs)
  DEFAULT: "rounded-lg", // 8px

  // Cards and panels
  card: "rounded-xl", // 12px

  // Large containers (modals, sections)
  lg: "rounded-2xl", // 16px

  // Circular (avatars, icon buttons)
  full: "rounded-full",
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
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }, // Smooth easing
  },

  // Fade in from top (for modals, dropdowns)
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },

  // Scale in (for floating buttons, chat bubbles)
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },

  // Slide in from right (for sidebars, panels)
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },

  // Slide in from left
  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },

  // Spring animation (for interactive elements)
  spring: {
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },

  // Stagger children (for lists)
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  // Stagger item (child of staggerContainer)
  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Hover animation variants for interactive elements
 */
export const hoverAnimations = {
  // Button hover - scale up slightly
  button: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },

  // Card hover - lift effect
  card: {
    y: -4,
    scale: 1.01,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },

  // Icon button - scale and rotate
  iconButton: {
    scale: 1.1,
    rotate: 5,
    transition: { duration: 0.2 },
  },

  // Link hover - slight scale
  link: {
    scale: 1.05,
    transition: { duration: 0.15 },
  },
};

/**
 * Tap animation variants
 */
export const tapAnimations = {
  // Button tap - scale down
  button: {
    scale: 0.98,
  },

  // Icon button - scale down more
  iconButton: {
    scale: 0.9,
  },

  // Card tap - subtle scale
  card: {
    scale: 0.99,
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
