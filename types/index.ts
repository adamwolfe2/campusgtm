/**
 * Core data types for Campus GTM
 * Following the Notion-style block-based architecture
 */

export const BlockType = {
  TEXT: "text",
  HEADING_1: "heading_1",
  HEADING_2: "heading_2",
  HEADING_3: "heading_3",
  BULLET_LIST: "bullet_list",
  CHECKLIST: "checklist",
  QUOTE: "quote",
  AI_BLOCK: "ai_block",
  IMAGE: "image",
} as const;

export type BlockType = (typeof BlockType)[keyof typeof BlockType];

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  companyName: string;
  companyUrl?: string;
  faviconUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBase {
  id: string;
  workspaceId: string;
  onboardingData: OnboardingData;
  uploadedFiles: UploadedFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingData {
  companyName: string;
  companyUrl?: string;
  targetAudience: string;
  mrrGoal?: string;
  competitors: string[];
  goals: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

export const StrategyModuleType = {
  AMBASSADOR_PROGRAM: "ambassador_program",
  CONTENT_CALENDAR: "content_calendar",
  ICP_DEFINITION: "icp_definition",
  OUTREACH_SCRIPTS: "outreach_scripts",
  VIRALITY_ENGINE: "virality_engine",
} as const;

export type StrategyModuleType =
  (typeof StrategyModuleType)[keyof typeof StrategyModuleType];

export interface StrategyModule {
  id: string;
  workspaceId: string;
  type: StrategyModuleType;
  title: string;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AmbassadorRole {
  name: string;
  description: string;
  compensation: {
    type: "swag" | "cash" | "mixed";
    details: string;
  };
  responsibilities: string[];
}

export interface ContentCalendarWeek {
  week: number;
  theme: string;
  posts: ContentPost[];
}

export interface ContentPost {
  day: number;
  platform: string;
  contentType: string;
  description: string;
  status: "planned" | "in_progress" | "completed";
}

export const UserRole = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
