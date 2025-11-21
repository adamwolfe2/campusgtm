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

// Attribution System Types

export interface ReferralCode {
  id: string;
  ambassador_id: string;
  workspace_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReferralClick {
  id: string;
  referral_code_id: string;
  code: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  clicked_at: string;
}

export interface AttributedSignup {
  id: string;
  user_id: string;
  referral_code_id: string;
  code: string;
  ambassador_id: string;
  workspace_id: string;
  click_id: string | null;
  days_to_convert: number | null;
  signed_up_at: string;
}

export interface AttributedConversion {
  id: string;
  signup_id: string;
  user_id: string;
  referral_code_id: string;
  code: string;
  ambassador_id: string;
  workspace_id: string;
  conversion_type: 'trial_start' | 'paid_subscription' | 'one_time_purchase';
  revenue_amount: number | null;
  currency: string;
  plan_name: string | null;
  billing_interval: string | null;
  days_to_convert: number | null;
  converted_at: string;
}

export interface AmbassadorStats {
  id: string;
  ambassador_id: string;
  workspace_id: string;
  referral_code: string;
  total_clicks: number;
  total_signups: number;
  total_conversions: number;
  total_revenue: number;
  conversion_rate: number | null;
  signup_to_paid_rate: number | null;
  avg_days_to_signup: number | null;
  avg_days_to_conversion: number | null;
  last_click_at: string | null;
  last_signup_at: string | null;
  last_conversion_at: string | null;
  last_updated: string;
}

export interface AttributionDailySnapshot {
  id: string;
  ambassador_id: string;
  workspace_id: string;
  referral_code: string;
  snapshot_date: string;
  clicks_today: number;
  signups_today: number;
  conversions_today: number;
  revenue_today: number;
  created_at: string;
}
