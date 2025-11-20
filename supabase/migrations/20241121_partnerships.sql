-- Partnership System Tables
-- For influencer discovery and partnership opportunities

-- Saved Influencers
CREATE TABLE IF NOT EXISTS saved_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'youtube', 'instagram', 'tiktok', 'reddit'
  follower_count INTEGER,
  engagement_rate DECIMAL(5,2), -- e.g., 4.5%
  niche TEXT,
  profile_url TEXT NOT NULL,
  recent_topics TEXT[], -- Array of topics they discuss
  audience_demographics TEXT,
  brand_fit_score INTEGER, -- 0-100
  estimated_cost TEXT, -- "$50-200 per post" or "Might do for free product"
  outreach_strategy TEXT, -- AI-generated personalized approach
  outreach_status TEXT DEFAULT 'not_contacted', -- 'not_contacted', 'reached_out', 'responded', 'negotiating', 'active', 'declined'
  notes TEXT,
  metadata JSONB DEFAULT '{}', -- Additional data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workspace_influencer UNIQUE (workspace_id, handle, platform)
);

CREATE INDEX idx_saved_influencers_workspace ON saved_influencers(workspace_id);
CREATE INDEX idx_saved_influencers_platform ON saved_influencers(platform);
CREATE INDEX idx_saved_influencers_brand_fit ON saved_influencers(brand_fit_score DESC);
CREATE INDEX idx_saved_influencers_status ON saved_influencers(outreach_status);

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

-- Influencer Outreach History
CREATE TABLE IF NOT EXISTS influencer_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES saved_influencers(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  outreach_type TEXT NOT NULL, -- 'email', 'dm', 'comment', 'mention'
  message TEXT,
  response TEXT,
  response_received BOOLEAN DEFAULT false,
  response_sentiment TEXT, -- 'positive', 'neutral', 'negative'
  follow_up_date DATE,
  outcome TEXT, -- 'no_response', 'declined', 'interested', 'agreed', 'completed'
  actual_cost TEXT, -- Actual cost paid if partnership happened
  roi_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_influencer_outreach_influencer ON influencer_outreach(influencer_id);
CREATE INDEX idx_influencer_outreach_workspace ON influencer_outreach(workspace_id);
CREATE INDEX idx_influencer_outreach_date ON influencer_outreach(created_at DESC);

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

CREATE TRIGGER update_saved_influencers_updated_at BEFORE UPDATE ON saved_influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_partnerships_updated_at BEFORE UPDATE ON saved_partnerships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security for multi-tenant)
ALTER TABLE saved_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_metrics ENABLE ROW LEVEL SECURITY;

-- Note: Actual RLS policies would be added based on your auth setup
-- Example policy structure (adjust based on your auth.users setup):
-- CREATE POLICY "Users can view their workspace influencers" ON saved_influencers
--   FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
--
-- CREATE POLICY "Users can insert their workspace influencers" ON saved_influencers
--   FOR INSERT WITH CHECK (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
--
-- CREATE POLICY "Users can update their workspace influencers" ON saved_influencers
--   FOR UPDATE USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
--
-- Similar policies for saved_partnerships, influencer_outreach, partnership_outreach, and partnership_metrics
