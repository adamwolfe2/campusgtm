// Manual type definitions for new database tables
// These will be replaced by generated types after running migrations

export interface AutomationPreferences {
  id: string;
  workspace_id: string;
  email: string | null;
  enable_daily_digest: boolean;
  enable_weekly_digest: boolean;
  enable_alerts: boolean;
  preferred_send_time: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledMonitor {
  id: string;
  workspace_id: string;
  monitor_type: 'keyword' | 'community' | 'competitor';
  config: Record<string, any>;
  frequency: 'hourly' | 'daily' | 'weekly';
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  workspace_id: string;
  job_type: string;
  status: 'success' | 'failed' | 'partial';
  summary: string | null;
  details: Record<string, any> | null;
  executed_at: string;
}

export interface SavedPartnership {
  id: string;
  workspace_id: string;
  company_name: string;
  website: string | null;
  partnership_type: string[];
  mutual_benefit_score: number | null;
  outreach_strategy: string | null;
  outreach_status: 'not_contacted' | 'reached_out' | 'responded' | 'negotiating' | 'active';
  notes: string | null;
  created_at: string;
}

export interface SavedEvent {
  id: string;
  workspace_id: string;
  name: string;
  event_type: string;
  date: string | null;
  location: string | null;
  website: string | null;
  relevance_score: number | null;
  recommended_action: string | null;
  attendance_status: 'considering' | 'registered' | 'attended' | 'passed';
  notes: string | null;
  created_at: string;
}
