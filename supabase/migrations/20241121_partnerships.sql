-- Partnership System Tables
-- For B2B partnership discovery and outreach tracking

-- Saved Partnership Opportunities
CREATE TABLE IF NOT EXISTS saved_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  website TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  estimated_size TEXT, -- "10-50 employees", "50-200 employees"
  shared_audience TEXT, -- Description of shared target audience
  partnership_type TEXT[], -- Array: ['co-marketing', 'integration', 'referral', 'content']
  complementary_products TEXT, -- How products complement each other
  mutual_benefit_score INTEGER, -- 0-100
  outreach_strategy TEXT, -- Personalized partnership pitch
  contact_info JSONB DEFAULT '{}', -- { linkedinUrl, email, foundersName }
  outreach_status TEXT DEFAULT 'not_contacted', -- 'not_contacted', 'reached_out', 'responded', 'negotiating', 'active', 'declined'
  notes TEXT,
  metadata JSONB DEFAULT '{}', -- Additional data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workspace_partnership UNIQUE (workspace_id, website)
);

CREATE INDEX idx_saved_partnerships_workspace ON saved_partnerships(workspace_id);
CREATE INDEX idx_saved_partnerships_benefit ON saved_partnerships(mutual_benefit_score DESC);
CREATE INDEX idx_saved_partnerships_status ON saved_partnerships(outreach_status);
CREATE INDEX idx_saved_partnerships_type ON saved_partnerships USING GIN(partnership_type);

-- Partnership Outreach History
CREATE TABLE IF NOT EXISTS partnership_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES saved_partnerships(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  outreach_type TEXT NOT NULL, -- 'email', 'linkedin', 'meeting', 'call'
  message TEXT,
  contact_person TEXT, -- Who was contacted
  response TEXT,
  response_received BOOLEAN DEFAULT false,
  response_sentiment TEXT, -- 'positive', 'neutral', 'negative'
  follow_up_date DATE,
  outcome TEXT, -- 'no_response', 'declined', 'exploring', 'in_negotiation', 'agreed', 'active'
  partnership_value TEXT, -- Estimated value of the partnership
  roi_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partnership_outreach_partnership ON partnership_outreach(partnership_id);
CREATE INDEX idx_partnership_outreach_workspace ON partnership_outreach(workspace_id);
CREATE INDEX idx_partnership_outreach_date ON partnership_outreach(created_at DESC);

-- Partnership Performance Metrics (for active partnerships)
CREATE TABLE IF NOT EXISTS partnership_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES saved_partnerships(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  metric_type TEXT NOT NULL, -- 'co_marketing', 'referrals', 'integration_usage', 'content_reach'
  metric_value INTEGER, -- e.g., number of referrals, reach count
  metric_details JSONB DEFAULT '{}', -- Additional metric-specific data
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partnership_metrics_partnership ON partnership_metrics(partnership_id);
CREATE INDEX idx_partnership_metrics_workspace ON partnership_metrics(workspace_id);
CREATE INDEX idx_partnership_metrics_date ON partnership_metrics(metric_date DESC);
CREATE INDEX idx_partnership_metrics_type ON partnership_metrics(metric_type);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_partnerships_updated_at BEFORE UPDATE ON saved_partnerships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security for multi-tenant)
ALTER TABLE saved_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_metrics ENABLE ROW LEVEL SECURITY;

-- Note: Actual RLS policies would be added based on your auth setup
-- Example policy structure (adjust based on your auth.users setup):
-- CREATE POLICY "Users can view their workspace partnerships" ON saved_partnerships
--   FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
--
-- CREATE POLICY "Users can insert their workspace partnerships" ON saved_partnerships
--   FOR INSERT WITH CHECK (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
--
-- CREATE POLICY "Users can update their workspace partnerships" ON saved_partnerships
--   FOR UPDATE USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
--
-- Similar policies for partnership_outreach and partnership_metrics
