"use server";

import { supabase, isSupabaseConfigured } from "@/lib/database/supabase";
import { createWorkspaceEvent, WorkspaceEventType } from "@/lib/database/workspace-events-service";

/**
 * Server action to update a block's content
 */
export async function updateBlockContent(
  blockId: string,
  content: string,
  workspaceId?: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      // For localStorage mode, we'll handle this client-side
      return { success: true };
    }

    const { error } = await supabase!
      .from("blocks")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", blockId);

    if (error) {
      console.error("Failed to update block:", error);
      return { success: false, error: error.message };
    }

    // Trigger workspace event for realtime updates
    if (workspaceId && userId) {
      await createWorkspaceEvent(
        workspaceId,
        userId,
        WorkspaceEventType.MODULE_UPDATED,
        { blockId, action: 'content_updated' }
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update block:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server action to update a block's checked status (for checklist blocks)
 */
export async function updateBlockChecked(
  blockId: string,
  checked: boolean,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    const { error } = await supabase!
      .from("blocks")
      .update({
        metadata: { checked },
        updated_at: new Date().toISOString(),
      })
      .eq("id", blockId);

    if (error) {
      console.error("Failed to update block:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update block:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server action to update a module's title
 */
export async function updateModuleTitle(
  moduleId: string,
  title: string,
  workspaceId?: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    const { error } = await supabase!
      .from("strategy_modules")
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", moduleId);

    if (error) {
      console.error("Failed to update module:", error);
      return { success: false, error: error.message };
    }

    // Trigger workspace event for realtime updates
    if (workspaceId && userId) {
      await createWorkspaceEvent(
        workspaceId,
        userId,
        WorkspaceEventType.MODULE_UPDATED,
        { moduleId, moduleTitle: title }
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update module:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server action to delete a block
 */
export async function deleteBlock(
  blockId: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    const { error } = await supabase!
      .from("blocks")
      .delete()
      .eq("id", blockId);

    if (error) {
      console.error("Failed to delete block:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete block:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server action to add a new block to a module
 */
export async function addBlock(
  moduleId: string,
  type: string,
  content: string,
  position: number,
  workspaceId?: string,
  userId?: string
): Promise<{ success: boolean; blockId?: string; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true, blockId: Date.now().toString() };
    }

    const { data, error } = await supabase!
      .from("blocks")
      .insert({
        module_id: moduleId,
        type,
        content,
        position,
        metadata: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to add block:", error);
      return { success: false, error: error.message };
    }

    // Trigger workspace event for realtime updates
    if (workspaceId && userId) {
      await createWorkspaceEvent(
        workspaceId,
        userId,
        WorkspaceEventType.BLOCK_ADDED,
        { moduleId, blockType: type, blockId: data.id }
      );
    }

    return { success: true, blockId: data.id };
  } catch (error) {
    console.error("Failed to add block:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
