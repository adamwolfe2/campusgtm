/**
 * Database Types
 * Generated from Supabase schema
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company_name: string;
          company_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          company_name: string;
          company_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          company_name?: string;
          company_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      strategy_modules: {
        Row: {
          id: string;
          workspace_id: string;
          type: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          type: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          type?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      blocks: {
        Row: {
          id: string;
          module_id: string;
          type: string;
          content: string;
          metadata: Record<string, unknown> | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          type: string;
          content: string;
          metadata?: Record<string, unknown> | null;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          type?: string;
          content?: string;
          metadata?: Record<string, unknown> | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      onboarding_data: {
        Row: {
          id: string;
          workspace_id: string;
          answers: Record<string, unknown>;
          scraped_website: Record<string, unknown> | null;
          uploaded_documents: Record<string, unknown>[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          answers: Record<string, unknown>;
          scraped_website?: Record<string, unknown> | null;
          uploaded_documents?: Record<string, unknown>[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          answers?: Record<string, unknown>;
          scraped_website?: Record<string, unknown> | null;
          uploaded_documents?: Record<string, unknown>[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      generated_strategies: {
        Row: {
          id: string;
          workspace_id: string;
          strategy: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          strategy: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          strategy?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          metadata: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read?: boolean;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          read?: boolean;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string | null;
          question_id: string;
          question: string;
          answer: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id?: string | null;
          question_id: string;
          question: string;
          answer: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string | null;
          question_id?: string;
          question?: string;
          answer?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
