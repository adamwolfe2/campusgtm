/**
 * Workspace Storage Service
 * localStorage-based storage for workspaces, documents, and blocks
 * Simple implementation for MVP - will be replaced with database later
 */

import type { Workspace, StrategyModule } from "@/types";
import type { OnboardingData } from "@/types/onboarding";
import type { GTMStrategy } from "@/types/ai";

export interface WorkspaceWithModules extends Workspace {
  modules: StrategyModule[];
  onboardingData?: OnboardingData;
  generatedStrategy?: GTMStrategy;
}

const STORAGE_KEYS = {
  WORKSPACES: "campusgtm-workspaces",
  CURRENT_WORKSPACE: "campusgtm-current-workspace",
} as const;

/**
 * Creates a new workspace
 */
export function createWorkspace(
  name: string,
  companyName: string,
  companyUrl?: string
): WorkspaceWithModules {
  const workspace: WorkspaceWithModules = {
    id: generateId(),
    name,
    companyName,
    companyUrl,
    modules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const workspaces = getWorkspaces();
  workspaces.push(workspace);
  saveWorkspaces(workspaces);
  setCurrentWorkspace(workspace.id);

  return workspace;
}

/**
 * Gets all workspaces
 */
export function getWorkspaces(): WorkspaceWithModules[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
    if (!stored) {
      return [];
    }

    const workspaces = JSON.parse(stored);
    // Convert date strings back to Date objects
    return workspaces.map((w: WorkspaceWithModules) => ({
      ...w,
      createdAt: new Date(w.createdAt),
      updatedAt: new Date(w.updatedAt),
      modules: w.modules.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
        blocks: m.blocks.map((b) => ({
          ...b,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        })),
      })),
    }));
  } catch {
    return [];
  }
}

/**
 * Gets a workspace by ID
 */
export function getWorkspace(id: string): WorkspaceWithModules | null {
  const workspaces = getWorkspaces();
  return workspaces.find((w) => w.id === id) || null;
}

/**
 * Updates a workspace
 */
export function updateWorkspace(
  id: string,
  updates: Partial<WorkspaceWithModules>
): WorkspaceWithModules | null {
  const workspaces = getWorkspaces();
  const index = workspaces.findIndex((w) => w.id === id);

  if (index === -1) {
    return null;
  }

  workspaces[index] = {
    ...workspaces[index],
    ...updates,
    updatedAt: new Date(),
  };

  saveWorkspaces(workspaces);
  return workspaces[index];
}

/**
 * Deletes a workspace
 */
export function deleteWorkspace(id: string): boolean {
  const workspaces = getWorkspaces();
  const filtered = workspaces.filter((w) => w.id !== id);

  if (filtered.length === workspaces.length) {
    return false; // Workspace not found
  }

  saveWorkspaces(filtered);

  // Clear current workspace if it was deleted
  if (getCurrentWorkspaceId() === id) {
    clearCurrentWorkspace();
  }

  return true;
}

/**
 * Adds a strategy module to a workspace
 */
export function addStrategyModule(
  workspaceId: string,
  module: StrategyModule
): WorkspaceWithModules | null {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) {
    return null;
  }

  workspace.modules.push(module);
  return updateWorkspace(workspaceId, { modules: workspace.modules });
}

/**
 * Updates a strategy module
 */
export function updateStrategyModule(
  workspaceId: string,
  moduleId: string,
  updates: Partial<StrategyModule>
): WorkspaceWithModules | null {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) {
    return null;
  }

  const moduleIndex = workspace.modules.findIndex((m) => m.id === moduleId);
  if (moduleIndex === -1) {
    return null;
  }

  workspace.modules[moduleIndex] = {
    ...workspace.modules[moduleIndex],
    ...updates,
    updatedAt: new Date(),
  };

  return updateWorkspace(workspaceId, { modules: workspace.modules });
}

/**
 * Gets current workspace ID
 */
export function getCurrentWorkspaceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(STORAGE_KEYS.CURRENT_WORKSPACE);
}

/**
 * Sets current workspace
 */
export function setCurrentWorkspace(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_WORKSPACE, id);
}

/**
 * Gets current workspace
 */
export function getCurrentWorkspace(): WorkspaceWithModules | null {
  const id = getCurrentWorkspaceId();
  if (!id) {
    return null;
  }

  return getWorkspace(id);
}

/**
 * Clears current workspace
 */
export function clearCurrentWorkspace(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKSPACE);
}

/**
 * Saves workspaces to localStorage
 */
function saveWorkspaces(workspaces: WorkspaceWithModules[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
}

/**
 * Generates a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clears all workspace data (useful for testing)
 */
export function clearAllWorkspaces(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.WORKSPACES);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKSPACE);
}
