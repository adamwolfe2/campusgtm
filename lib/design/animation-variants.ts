/**
 * Framer Motion Animation Variants
 * Based on Notion Design System
 */

import type { Variants } from "framer-motion";

// Easing functions
export const easing = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
};

// Timing
export const timing = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.35,
};

// Page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.normal,
      ease: easing.out,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: timing.fast,
      ease: easing.in,
    },
  },
};

// Card hover lift
export const cardVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
  },
  hover: {
    y: -2,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.08)',
    transition: {
      duration: timing.normal,
      ease: easing.out,
    },
  },
  tap: {
    y: 0,
    scale: 0.98,
    transition: {
      duration: timing.instant,
    },
  },
};

// Modal slide-up
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: timing.slow,
      ease: easing.out,
    },
  },
};

// Backdrop fade
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: timing.normal,
    },
  },
};

// Dropdown slide-down
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: timing.fast,
      ease: easing.out,
    },
  },
};

// Sidebar slide
export const sidebarVariants: Variants = {
  open: {
    x: 0,
    transition: {
      duration: timing.normal,
      ease: easing.out,
    },
  },
  closed: {
    x: '-100%',
    transition: {
      duration: timing.normal,
      ease: easing.out,
    },
  },
};

// Staggered list
export const listVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: timing.fast,
    },
  },
};

// Block animations
export const blockVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.fast,
      ease: easing.out,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: timing.fast,
      ease: easing.in,
    },
  },
};

// Toast slide-in from right
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    x: '100%',
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: timing.slow,
      ease: easing.out,
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: timing.fast,
      ease: easing.in,
    },
  },
};

// Slide from bottom (mobile sheet)
export const sheetVariants: Variants = {
  hidden: {
    y: '100%',
  },
  visible: {
    y: 0,
    transition: {
      duration: timing.slow,
      ease: easing.out,
    },
  },
  exit: {
    y: '100%',
    transition: {
      duration: timing.normal,
      ease: easing.in,
    },
  },
};

// Fade and scale
export const fadeScaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: timing.normal,
      ease: easing.out,
    },
  },
};

// Spring animation for checkboxes
export const checkboxVariants: Variants = {
  checked: {
    scale: [1, 1.1, 1],
    transition: {
      duration: timing.normal,
      ease: easing.out,
    },
  },
  unchecked: {
    scale: 1,
  },
};

// Hover lift (subtle)
export const hoverLiftVariants: Variants = {
  rest: {
    y: 0,
  },
  hover: {
    y: -1,
    transition: {
      duration: timing.fast,
      ease: easing.out,
    },
  },
};
