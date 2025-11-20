-- Automation System Tables
-- For scheduled monitoring, user preferences, and automation logs

-- User automation preferences
CREATE TABLE IF NOT EXISTS automation_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  email TEXT,
  enable_daily_digest BOOLEAN DEFAULT false,
  enable_weekly_digest BOOLEAN DEFAULT false,
  enable_alerts BOOLEAN DEFAULT true,
  preferred_send_time TIME DEFAULT '09:00:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workspace_automation_prefs UNIQUE (workspace_id)
);

CREATE INDEX idx_automation_preferences_workspace ON automation_preferences(workspace_id);

-- Scheduled monitors (user-configured monitoring schedules)
CREATE TABLE IF NOT EXISTS scheduled_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  monitor_type TEXT NOT NULL, -- 'keyword', 'community', 'competitor'
  config JSONB NOT NULL, -- Configuration specific to monitor type
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'hourly', 'every_6_hours'
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_monitors_workspace ON scheduled_monitors(workspace_id);
CREATE INDEX idx_scheduled_monitors_active ON scheduled_monitors(is_active);
CREATE INDEX idx_scheduled_monitors_next_run ON scheduled_monitors(next_run_at);

-- Automation logs (execution history)
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  job_type TEXT NOT NULL, -- 'daily_scan', 'weekly_digest', 'competitor_monitor'
  status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  summary TEXT,
  details JSONB DEFAULT '{}',
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_logs_workspace ON automation_logs(workspace_id);
CREATE INDEX idx_automation_logs_executed ON automation_logs(executed_at DESC);
CREATE INDEX idx_automation_logs_job_type ON automation_logs(job_type);
CREATE INDEX idx_automation_logs_status ON automation_logs(status);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_automation_preferences_updated_at
  BEFORE UPDATE ON automation_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_monitors_updated_at
  BEFORE UPDATE ON scheduled_monitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security for multi-tenant)
ALTER TABLE automation_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Policies for automation_preferences
CREATE POLICY "Users can view their workspace automation preferences"
  ON automation_preferences FOR SELECT
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their workspace automation preferences"
  ON automation_preferences FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their workspace automation preferences"
  ON automation_preferences FOR UPDATE
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their workspace automation preferences"
  ON automation_preferences FOR DELETE
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid()
  ));

-- Policies for scheduled_monitors
CREATE POLICY "Users can view their workspace scheduled monitors"
  ON scheduled_monitors FOR SELECT
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their workspace scheduled monitors"
  ON scheduled_monitors FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their workspace scheduled monitors"
  ON scheduled_monitors FOR UPDATE
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their workspace scheduled monitors"
  ON scheduled_monitors FOR DELETE
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid()
  ));

-- Policies for automation_logs
CREATE POLICY "Users can view their workspace automation logs"
  ON automation_logs FOR SELECT
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid()
  ));

-- Note: Only system can insert automation logs (cron jobs)
-- Users have read-only access

-- Insert default automation preferences for existing workspaces
INSERT INTO automation_preferences (workspace_id, enable_daily_digest, enable_weekly_digest, enable_alerts)
SELECT id, false, false, true
FROM workspaces
ON CONFLICT (workspace_id) DO NOTHING;
