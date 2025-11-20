/**
 * Client-side block operations
 * Handles both localStorage and Supabase modes
 */

import { updateBlockContent as updateBlockContentAction } from "@/app/actions/modules";
import * as storage from "@/lib/storage/workspace-storage";

/**
 * Determines if we're in localStorage mode (client-side check)
 */
function isLocalStorageMode(): boolean {
  // Check if we have workspaces in localStorage
  try {
    const workspaces = storage.getWorkspaces();
    return workspaces.length > 0;
  } catch {
    return false;
  }
}

/**
 * Updates a block's content (works in both modes)
 */
export async function updateBlockContent(
  blockId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  // For localStorage mode, update directly
  if (isLocalStorageMode()) {
    const success = storage.updateBlockContent(blockId, content);
    return { success };
  }

  // For Supabase mode, use server action
  return await updateBlockContentAction(blockId, content);
}

/**
 * Updates a block's metadata
 */
export async function updateBlockMetadata(
  blockId: string,
  metadata: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  // For localStorage mode, update directly
  if (isLocalStorageMode()) {
    const success = storage.updateBlockMetadata(blockId, metadata);
    return { success };
  }

  // For Supabase mode, would use server action (not implemented yet)
  return { success: true };
}
