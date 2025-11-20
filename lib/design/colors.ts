/**
 * Notion Design System Colors
 * 10-color palette for consistent theming
 */

export const notionColors = {
  grey: {
    text: '#787774',
    bg: '#F7F6F3',
    dark: '#2F2F2F',
  },
  brown: {
    text: '#9F6B53',
    bg: '#F4EEEE',
  },
  orange: {
    text: '#D9730D',
    bg: '#FBECDD',
  },
  yellow: {
    text: '#CB912F',
    bg: '#FBF3DB',
  },
  green: {
    text: '#448361',
    bg: '#EDF3EC',
  },
  blue: {
    text: '#337EA9',
    bg: '#E7F3F8',
    accent: '#2EAADC',
  },
  purple: {
    text: '#9065B0',
    bg: '#F6F3F9',
  },
  pink: {
    text: '#C14C8A',
    bg: '#FAF1F5',
  },
  red: {
    text: '#D44C47',
    bg: '#FFEEF0',
  },
} as const;

export const baseColors = {
  bg: {
    primary: '#FFFFFF',
    secondary: '#F7F6F3',
    tertiary: '#EDEDED',
  },
  text: {
    primary: '#37352F',
    secondary: '#787774',
    tertiary: '#9B9A97',
  },
  border: {
    default: '#E3E2E0',
    hover: '#D3D3D3',
  },
} as const;

// Type for color names
export type NotionColorName = keyof typeof notionColors;

// Helper to get color by name
export function getNotionColor(color: NotionColorName): typeof notionColors[NotionColorName] {
  return notionColors[color];
}

// Map strategy module types to colors
export const MODULE_COLORS = {
  AMBASSADOR_PROGRAM: 'bg-notion-blue-accent',
  CONTENT_CALENDAR: 'bg-notion-green-text',
  ICP_DEFINITION: 'bg-notion-purple-text',
  OUTREACH_SCRIPTS: 'bg-notion-orange-text',
  VIRALITY_ENGINE: 'bg-notion-pink-text',
} as const;

// Status colors
export const statusColors = {
  success: notionColors.green,
  error: notionColors.red,
  warning: notionColors.orange,
  info: notionColors.blue,
} as const;

// Get status color
export type StatusType = keyof typeof statusColors;

export function getStatusColor(status: StatusType): typeof statusColors[StatusType] {
  return statusColors[status];
}
