/**
 * Unified Workspace Service
 * Works with both Supabase (production) and localStorage (development)
 * Automatically detects which to use based on configuration
 */

import type { Workspace, StrategyModule } from "@/types";
import type { OnboardingData } from "@/types/onboarding";
import type { GTMStrategy } from "@/types/ai";
import { supabase, isSupabaseConfigured } from "./supabase";
import * as localStorage from "../storage/workspace-storage";
import {
  WorkspaceCreateSchema,
  // WorkspaceUpdateSchema, // TODO: Use when implementing update functionality
  // IdSchema, // TODO: Use when implementing ID validation
  // UuidSchema, // TODO: Use when implementing UUID validation
} from "./validators";

export interface WorkspaceWithModules extends Workspace {
  modules: StrategyModule[];
  onboardingData?: OnboardingData;
  generatedStrategy?: GTMStrategy;
}

/**
 * Creates a new workspace
 */
export async function createWorkspace(
  name: string,
  companyName: string,
  companyUrl?: string,
  userId?: string,
  faviconUrl?: string
): Promise<WorkspaceWithModules> {
  if (isSupabaseConfigured() && userId) {
    // Validate inputs
    const validated = WorkspaceCreateSchema.parse({
      name,
      companyName,
      companyUrl: companyUrl || "",
      userId,
    });

    // Use Supabase
    const client = supabase;
    if (!client) {
      throw new Error("Supabase client not configured");
    }

    const { data, error } = await client
      .from("workspaces")
      .insert({
        user_id: validated.userId,
        name: validated.name,
        company_name: validated.companyName,
        company_url: validated.companyUrl || null,
        favicon_url: faviconUrl || null,
      } as any) // Type assertion needed until Supabase types are generated
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create workspace: ${error.message}`);
    }

    const workspace = data as any; // Type assertion until Supabase types are generated

    return {
      id: workspace.id,
      name: workspace.name,
      companyName: workspace.company_name,
      companyUrl: workspace.company_url || undefined,
      faviconUrl: workspace.favicon_url || undefined,
      modules: [],
      createdAt: new Date(workspace.created_at),
      updatedAt: new Date(workspace.updated_at),
    };
  } else {
    // Use localStorage fallback
    return localStorage.createWorkspace(name, companyName, companyUrl);
  }
}

/**
 * Gets all workspaces for a user
 */
export async function getWorkspaces(
  userId?: string
): Promise<WorkspaceWithModules[]> {
  if (isSupabaseConfigured() && userId) {
    // Use Supabase
    const { data: workspaces, error } = await supabase!
      .from("workspaces")
      .select(
        `
        *,
        strategy_modules (
          *,
          blocks (*)
        ),
        onboarding_data (*),
        generated_strategies (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch workspaces: ${error.message}`);
    }

    return workspaces.map((w: Record<string, unknown>) => ({
      id: w.id as string,
      name: w.name as string,
      companyName: w.company_name as string,
      companyUrl: (w.company_url as string) || undefined,
      modules: ((w.strategy_modules as Record<string, unknown>[]) || []).map(
        (m) => ({
          id: m.id as string,
          workspaceId: m.workspace_id as string,
          type: m.type as string,
          title: m.title as string,
          blocks: ((m.blocks as Record<string, unknown>[]) || [])
            .sort((a, b) => (a.position as number) - (b.position as number))
            .map((b) => ({
              id: b.id as string,
              type: b.type as string,
              content: b.content as string,
              metadata: b.metadata as Record<string, unknown> | undefined,
              createdAt: new Date(b.created_at as string),
              updatedAt: new Date(b.updated_at as string),
            })),
          createdAt: new Date(m.created_at as string),
          updatedAt: new Date(m.updated_at as string),
        })
      ),
      onboardingData:
        ((w.onboarding_data as Record<string, unknown>[])?.[0] as Record<string, unknown>) || undefined,
      generatedStrategy:
        ((w.generated_strategies as Record<string, unknown>[])?.[0]?.strategy as GTMStrategy) || undefined,
      createdAt: new Date(w.created_at as string),
      updatedAt: new Date(w.updated_at as string),
    })) as unknown as WorkspaceWithModules[]; // Type assertion until Supabase types are generated
  } else {
    // Use localStorage fallback
    return localStorage.getWorkspaces();
  }
}

/**
 * Gets a single workspace by ID
 */
export async function getWorkspace(
  id: string,
  userId?: string
): Promise<WorkspaceWithModules | null> {
  if (isSupabaseConfigured() && userId) {
    // Use Supabase
    const { data, error } = await supabase!
      .from("workspaces")
      .select(
        `
        *,
        strategy_modules (
          *,
          blocks (*)
        ),
        onboarding_data (*),
        generated_strategies (*)
      `
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to fetch workspace: ${error.message}`);
    }

    const workspace = data as any; // Type assertion until Supabase types are generated

    return {
      id: workspace.id,
      name: workspace.name,
      companyName: workspace.company_name,
      companyUrl: workspace.company_url || undefined,
      modules: ((workspace.strategy_modules as Record<string, unknown>[]) || []).map(
        (m) => ({
          id: m.id as string,
          workspaceId: m.workspace_id as string,
          type: m.type as any, // Type assertion until Supabase types are generated
          title: m.title as string,
          blocks: ((m.blocks as Record<string, unknown>[]) || [])
            .sort((a, b) => (a.position as number) - (b.position as number))
            .map((b) => ({
              id: b.id as string,
              type: b.type as any, // Type assertion until Supabase types are generated
              content: b.content as string,
              metadata: b.metadata as Record<string, unknown> | undefined,
              createdAt: new Date(b.created_at as string),
              updatedAt: new Date(b.updated_at as string),
            })),
          createdAt: new Date(m.created_at as string),
          updatedAt: new Date(m.updated_at as string),
        })
      ) as any, // Type assertion until Supabase types are generated
      onboardingData:
        ((workspace.onboarding_data as Record<string, unknown>[])?.[0] as any) || undefined,
      generatedStrategy:
        ((workspace.generated_strategies as Record<string, unknown>[])?.[0]?.strategy as GTMStrategy) || undefined,
      createdAt: new Date(workspace.created_at),
      updatedAt: new Date(workspace.updated_at),
    };
  } else {
    // Use localStorage fallback
    return localStorage.getWorkspace(id);
  }
}

/**
 * Updates a workspace
 */
export async function updateWorkspace(
  id: string,
  updates: Partial<WorkspaceWithModules>,
  userId?: string
): Promise<WorkspaceWithModules | null> {
  if (isSupabaseConfigured() && userId) {
    // Use Supabase
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name) {
      dbUpdates.name = updates.name;
    }
    if (updates.companyName) {
      dbUpdates.company_name = updates.companyName;
    }
    if (updates.companyUrl !== undefined) {
      dbUpdates.company_url = updates.companyUrl;
    }

    const { data: _data, error } = (await (supabase!
      .from("workspaces") as any) // Type assertion until Supabase types are generated
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()) as any;

    if (error) {
      throw new Error(`Failed to update workspace: ${error.message}`);
    }

    // Fetch full workspace with relations
    return getWorkspace(id, userId);
  } else {
    // Use localStorage fallback
    return localStorage.updateWorkspace(id, updates);
  }
}

/**
 * Deletes a workspace
 */
export async function deleteWorkspace(
  id: string,
  userId?: string
): Promise<boolean> {
  if (isSupabaseConfigured() && userId) {
    // Use Supabase (cascade delete handles modules/blocks)
    const { error } = await supabase!
      .from("workspaces")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete workspace: ${error.message}`);
    }

    return true;
  } else {
    // Use localStorage fallback
    return localStorage.deleteWorkspace(id);
  }
}

/**
 * Adds a strategy module to a workspace
 */
export async function addStrategyModule(
  workspaceId: string,
  module: StrategyModule,
  userId?: string
): Promise<WorkspaceWithModules | null> {
  if (isSupabaseConfigured() && userId) {
    // Use Supabase - insert module
    const { data: moduleData, error: moduleError } = (await (supabase!
      .from("strategy_modules") as any) // Type assertion until Supabase types are generated
      .insert({
        workspace_id: workspaceId,
        type: module.type,
        title: module.title,
      })
      .select()
      .single()) as any;

    if (moduleError) {
      throw new Error(`Failed to create module: ${moduleError.message}`);
    }

    // Insert blocks
    if (module.blocks.length > 0) {
      const blocks = module.blocks.map((block, index) => ({
        module_id: moduleData.id,
        type: block.type,
        content: block.content,
        metadata: block.metadata || null,
        position: index,
      }));

      const { error: blocksError } = (await (supabase!
        .from("blocks") as any) // Type assertion until Supabase types are generated
        .insert(blocks)) as any;

      if (blocksError) {
        throw new Error(`Failed to create blocks: ${blocksError.message}`);
      }
    }

    return getWorkspace(workspaceId, userId);
  } else {
    // Use localStorage fallback
    return localStorage.addStrategyModule(workspaceId, module);
  }
}

/**
 * Stores onboarding data for a workspace
 */
export async function storeOnboardingData(
  workspaceId: string,
  data: OnboardingData,
  userId?: string
): Promise<void> {
  if (isSupabaseConfigured() && userId) {
    // Use Supabase
    const { error } = (await (supabase!.from("onboarding_data") as any) // Type assertion until Supabase types are generated
      .insert({
        workspace_id: workspaceId,
        answers: data.answers as unknown as Record<string, unknown>,
        scraped_website: data.scrapedWebsite as unknown as Record<string, unknown> | null,
        uploaded_documents: data.uploadedDocuments as unknown as Record<string, unknown>[] | null,
      })) as any;

    if (error) {
      throw new Error(`Failed to store onboarding data: ${error.message}`);
    }
  }
  // For localStorage, this is already handled in updateWorkspace
}

/**
 * Stores generated strategy for a workspace
 */
export async function storeGeneratedStrategy(
  workspaceId: string,
  strategy: GTMStrategy,
  userId?: string
): Promise<void> {
  if (isSupabaseConfigured() && userId) {
    // Use Supabase
    const { error } = (await (supabase!.from("generated_strategies") as any) // Type assertion until Supabase types are generated
      .insert({
        workspace_id: workspaceId,
        strategy: strategy as unknown as Record<string, unknown>,
      })) as any;

    if (error) {
      throw new Error(`Failed to store strategy: ${error.message}`);
    }
  }
  // For localStorage, this is already handled in updateWorkspace
}

/**
 * Gets current workspace ID (localStorage only)
 */
export function getCurrentWorkspaceId(): string | null {
  return localStorage.getCurrentWorkspaceId();
}

/**
 * Sets current workspace (localStorage only)
 */
export function setCurrentWorkspace(id: string): void {
  localStorage.setCurrentWorkspace(id);
}
