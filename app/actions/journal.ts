"use server";

import { supabase, isSupabaseConfigured } from "@/lib/database/supabase";

export interface JournalEntry {
  id: string;
  userId: string;
  workspaceId?: string;
  questionId: string;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Server action to save a journal entry
 */
export async function saveJournalEntry(
  userId: string,
  questionId: string,
  question: string,
  answer: string,
  workspaceId?: string
): Promise<{ success: boolean; error?: string; entry?: JournalEntry }> {
  try {
    if (!isSupabaseConfigured()) {
      // For localStorage mode, we'll store in localStorage client-side
      return {
        success: true,
        entry: {
          id: Date.now().toString(),
          userId,
          workspaceId,
          questionId,
          question,
          answer,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    }

    const { data, error } = await supabase!
      .from("journal_entries")
      .insert({
        user_id: userId,
        workspace_id: workspaceId || null,
        question_id: questionId,
        question,
        answer,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save journal entry:", error);
      return { success: false, error: error.message };
    }

    const entry = data as any;
    return {
      success: true,
      entry: {
        id: entry.id,
        userId: entry.user_id,
        workspaceId: entry.workspace_id || undefined,
        questionId: entry.question_id,
        question: entry.question,
        answer: entry.answer,
        createdAt: new Date(entry.created_at),
        updatedAt: new Date(entry.updated_at),
      },
    };
  } catch (error) {
    console.error("Failed to save journal entry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server action to get all journal entries for a user
 */
export async function getJournalEntries(
  userId: string,
  workspaceId?: string
): Promise<JournalEntry[]> {
  try {
    if (!isSupabaseConfigured()) {
      // Return from localStorage if available
      return [];
    }

    let query = supabase!
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch journal entries:", error);
      return [];
    }

    return (data || []).map((entry: any) => ({
      id: entry.id,
      userId: entry.user_id,
      workspaceId: entry.workspace_id || undefined,
      questionId: entry.question_id,
      question: entry.question,
      answer: entry.answer,
      createdAt: new Date(entry.created_at),
      updatedAt: new Date(entry.updated_at),
    }));
  } catch (error) {
    console.error("Failed to fetch journal entries:", error);
    return [];
  }
}

/**
 * Server action to check if a question has been answered
 */
export async function hasAnsweredQuestion(
  userId: string,
  questionId: string
): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { count, error } = await supabase!
      .from("journal_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("question_id", questionId);

    if (error) {
      console.error("Failed to check question status:", error);
      return false;
    }

    return (count || 0) > 0;
  } catch (error) {
    console.error("Failed to check question status:", error);
    return false;
  }
}
