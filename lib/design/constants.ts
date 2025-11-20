/**
 * Design System Constants
 * Spacing, typography, shadows, and other design tokens
 */

// Spacing (4px grid system)
export const spacing = {
  1: 4,    // 4px
  2: 8,    // 8px
  3: 12,   // 12px
  4: 16,   // 16px
  5: 20,   // 20px
  6: 24,   // 24px
  8: 32,   // 32px
  12: 48,  // 48px
  16: 64,  // 64px
  24: 96,  // 96px
} as const;

// Typography
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
  },
  fontSize: {
    h1: 40,      // 40px
    h2: 32,      // 32px
    h3: 24,      // 24px
    h4: 20,      // 20px
    body: 16,    // 16px
    small: 14,   // 14px
    caption: 12, // 12px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const;

// Border radius
export const radius = {
  sm: 6,   // 6px
  md: 8,   // 8px
  lg: 12,  // 12px
  xl: 16,  // 16px
  full: 999, // 999px
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 4px 8px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.08)',
  lg: '0 12px 24px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.08)',
  focus: '0 0 0 3px rgba(46, 170, 220, 0.2)',
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  toast: 1400,
} as const;

// Animation timing
export const timing = {
  instant: 100,  // 100ms
  fast: 150,     // 150ms
  normal: 250,   // 250ms
  slow: 350,     // 350ms
} as const;

// Easing functions
export const easing = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Breakpoints
export const breakpoints = {
  mobile: 320,   // 320px
  tablet: 768,   // 768px
  desktop: 1024, // 1024px
  wide: 1280,    // 1280px
} as const;

// Touch targets (minimum sizes for interactive elements)
export const touchTargets = {
  mobile: 44,  // 44x44px
  desktop: 40, // 40x40px
  spacing: 8,  // 8px minimum between targets
} as const;

// Transition properties (CSS properties safe to animate)
export const animatableProperties = [
  'transform',
  'opacity',
  'filter',
  'backdrop-filter',
] as const;

// Don't animate these (causes layout reflow)
export const nonAnimatableProperties = [
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom',
  'margin',
  'padding',
] as const;
