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
      tracking_links: {
        Row: {
          id: string;
          user_id: string;
          ambassador_program_id: string | null;
          short_code: string;
          full_url: string;
          title: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ambassador_program_id?: string | null;
          short_code: string;
          full_url: string;
          title?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ambassador_program_id?: string | null;
          short_code?: string;
          full_url?: string;
          title?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      link_clicks: {
        Row: {
          id: string;
          link_id: string;
          ip_address: string | null;
          user_agent: string | null;
          referrer: string | null;
          clicked_at: string;
        };
        Insert: {
          id?: string;
          link_id: string;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          clicked_at?: string;
        };
        Update: {
          id?: string;
          link_id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          clicked_at?: string;
        };
      };
      link_signups: {
        Row: {
          id: string;
          link_id: string;
          email: string | null;
          full_name: string | null;
          metadata: Record<string, unknown> | null;
          signed_up_at: string;
        };
        Insert: {
          id?: string;
          link_id: string;
          email?: string | null;
          full_name?: string | null;
          metadata?: Record<string, unknown> | null;
          signed_up_at?: string;
        };
        Update: {
          id?: string;
          link_id?: string;
          email?: string | null;
          full_name?: string | null;
          metadata?: Record<string, unknown> | null;
          signed_up_at?: string;
        };
      };
      workspace_events: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          event_type: 'module_updated' | 'block_added' | 'user_joined' | 'strategy_generated';
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          event_type: 'module_updated' | 'block_added' | 'user_joined' | 'strategy_generated';
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string | null;
          event_type?: 'module_updated' | 'block_added' | 'user_joined' | 'strategy_generated';
          metadata?: Record<string, unknown> | null;
          created_at?: string;
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
