import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shadcn colors (keep existing)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Notion design system colors
        notion: {
          grey: { text: '#787774', bg: '#F7F6F3', dark: '#2F2F2F' },
          brown: { text: '#9F6B53', bg: '#F4EEEE' },
          orange: { text: '#D9730D', bg: '#FBECDD' },
          yellow: { text: '#CB912F', bg: '#FBF3DB' },
          green: { text: '#448361', bg: '#EDF3EC' },
          blue: { text: '#337EA9', bg: '#E7F3F8', accent: '#2EAADC' },
          purple: { text: '#9065B0', bg: '#F6F3F9' },
          pink: { text: '#C14C8A', bg: '#FAF1F5' },
          red: { text: '#D44C47', bg: '#FFEEF0' },
        },
        base: {
          'bg-primary': '#FFFFFF',
          'bg-secondary': '#F7F6F3',
          'bg-tertiary': '#EDEDED',
          'text-primary': '#37352F',
          'text-secondary': '#787774',
          'text-tertiary': '#9B9A97',
        },
      },
      spacing: {
        // Notion 4px grid system
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '24': '96px',
      },
      fontSize: {
        // Notion typography scale
        'h1': ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Noto Sans', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        // Shadcn (keep existing)
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Notion system
        'notion-sm': '6px',
        'notion-md': '8px',
        'notion-lg': '12px',
        'notion-xl': '16px',
      },
      boxShadow: {
        // Notion shadows
        'notion-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'notion-md': '0 4px 8px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.08)',
        'notion-lg': '0 12px 24px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.08)',
        'focus': '0 0 0 3px rgba(46, 170, 220, 0.2)',
      },
      transitionTimingFunction: {
        // Notion easing
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-expo': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      transitionDuration: {
        // Notion timing
        instant: '100ms',
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
      },
      zIndex: {
        // Notion z-index scale
        dropdown: '1000',
        sticky: '1100',
        modal: '1200',
        popover: '1300',
        toast: '1400',
      },
      keyframes: {
        // Shadcn animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Notion animations
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin": {
          to: { transform: "rotate(360deg)" },
        },
        "pulse-scale": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        // Shadcn animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Notion animations
        "fade-in": "fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slide-down 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-right": "slide-in-from-right 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "spin": "spin 0.8s linear infinite",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
