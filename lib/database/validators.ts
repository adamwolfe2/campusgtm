/**
 * Database Input Validators
 * Zod schemas for validating database inputs
 */

import { z } from "zod";

export const WorkspaceCreateSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
  companyName: z.string().min(1, "Company name is required").max(200),
  companyUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  userId: z.string().uuid("Invalid user ID"),
});

export const WorkspaceUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  companyName: z.string().min(1).max(200).optional(),
  companyUrl: z.string().url().optional().or(z.literal("")),
});

export const StrategyModuleSchema = z.object({
  id: z.string(),
  workspaceId: z.string().uuid(),
  type: z.enum([
    "ambassador_program",
    "content_calendar",
    "icp_definition",
    "outreach_scripts",
    "virality_engine",
  ]),
  title: z.string().min(1).max(200),
  blocks: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "text",
        "heading_1",
        "heading_2",
        "heading_3",
        "bullet_list",
        "checklist",
        "quote",
        "ai_block",
      ]),
      content: z.string(),
      metadata: z.record(z.string(), z.unknown()).optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BlockSchema = z.object({
  type: z.enum([
    "text",
    "heading_1",
    "heading_2",
    "heading_3",
    "bullet_list",
    "checklist",
    "quote",
    "ai_block",
  ]),
  content: z.string().max(50000), // 50KB limit
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const IdSchema = z.string().min(1, "ID is required");
export const UuidSchema = z.string().uuid("Invalid UUID");

export type WorkspaceCreateInput = z.infer<typeof WorkspaceCreateSchema>;
export type WorkspaceUpdateInput = z.infer<typeof WorkspaceUpdateSchema>;
export type StrategyModuleInput = z.infer<typeof StrategyModuleSchema>;
export type BlockInput = z.infer<typeof BlockSchema>;
