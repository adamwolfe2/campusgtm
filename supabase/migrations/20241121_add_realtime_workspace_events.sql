-- Migration: Add Realtime Workspace Events
-- Description: Creates workspace_events table for realtime collaboration
-- Created: 2024-11-21
-- Note: This migration assumes the realtime triggers have been created via Supabase SQL Editor
-- If not, run the corrected RLS policies from the Supabase assistant

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: workspace_events
-- Stores workspace collaboration events for realtime broadcasting
CREATE TABLE IF NOT EXISTS public.workspace_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id TEXT,
  event_type TEXT NOT NULL CHECK (
    event_type IN ('module_updated', 'block_added', 'user_joined', 'strategy_generated')
  ),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_events_workspace_created_at
  ON public.workspace_events (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workspace_events_event_type
  ON public.workspace_events (event_type);

-- Enable RLS
ALTER TABLE public.workspace_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can SELECT workspace events if they own the workspace
CREATE POLICY "Users can view events for their workspaces"
  ON public.workspace_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = workspace_events.workspace_id
      AND workspaces.user_id = auth.uid()::text
    )
  );

-- Users can INSERT workspace events only for workspaces they own
CREATE POLICY "Users can create events for their workspaces"
  ON public.workspace_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = workspace_events.workspace_id
      AND workspaces.user_id = auth.uid()::text
    )
  );

-- Service role can bypass (for server-side operations)
CREATE POLICY "Service role can do anything"
  ON public.workspace_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger function to broadcast workspace events (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.workspace_events_broadcast_trigger()
RETURNS TRIGGER SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'workspace::' || NEW.workspace_id::text || '::events',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger for workspace_events AFTER INSERT
DROP TRIGGER IF EXISTS workspace_events_broadcast_trigger ON public.workspace_events;
CREATE TRIGGER workspace_events_broadcast_trigger
  AFTER INSERT ON public.workspace_events
  FOR EACH ROW EXECUTE FUNCTION public.workspace_events_broadcast_trigger();

-- Trigger function to broadcast notifications (SECURITY DEFINER)
-- This applies to the existing notifications table
CREATE OR REPLACE FUNCTION public.notifications_broadcast_trigger()
RETURNS TRIGGER SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'user::' || NEW.user_id::text || '::notifications',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger for notifications AFTER INSERT
DROP TRIGGER IF EXISTS notifications_broadcast_trigger ON public.notifications;
CREATE TRIGGER notifications_broadcast_trigger
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.notifications_broadcast_trigger();

-- Add comment to table
COMMENT ON TABLE public.workspace_events IS 'Stores workspace collaboration events for realtime broadcasting to workspace members';
