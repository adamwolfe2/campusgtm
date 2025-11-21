-- Attribution System Tables
-- For tracking referral links, clicks, signups, and conversions

-- 1. Referral Codes (Ambassador Links)
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE, -- 'john-acme'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_ambassador_workspace UNIQUE (ambassador_id, workspace_id)
);

CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_ambassador ON referral_codes(ambassador_id);
CREATE INDEX idx_referral_codes_workspace ON referral_codes(workspace_id);

-- 2. Referral Clicks (Track every click)
CREATE TABLE IF NOT EXISTS referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- Denormalized for faster queries
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT, -- Where they came from
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  landing_page TEXT, -- What page they landed on
  country TEXT,
  city TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referral_clicks_code ON referral_clicks(code);
CREATE INDEX idx_referral_clicks_referral_code ON referral_clicks(referral_code_id);
CREATE INDEX idx_referral_clicks_date ON referral_clicks(clicked_at DESC);
CREATE INDEX idx_referral_clicks_device ON referral_clicks(device_type);

-- 3. Attributed Signups
CREATE TABLE IF NOT EXISTS attributed_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  ambassador_id UUID NOT NULL, -- Denormalized
  workspace_id UUID NOT NULL,
  click_id UUID REFERENCES referral_clicks(id), -- Original click
  days_to_convert INTEGER, -- Time from click to signup
  signed_up_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attributed_signups_user ON attributed_signups(user_id);
CREATE INDEX idx_attributed_signups_code ON attributed_signups(code);
CREATE INDEX idx_attributed_signups_ambassador ON attributed_signups(ambassador_id);
CREATE INDEX idx_attributed_signups_workspace ON attributed_signups(workspace_id);
CREATE INDEX idx_attributed_signups_date ON attributed_signups(signed_up_at DESC);

-- 4. Attributed Conversions (Free → Paid)
CREATE TABLE IF NOT EXISTS attributed_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_id UUID NOT NULL REFERENCES attributed_signups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  ambassador_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  conversion_type TEXT NOT NULL, -- 'trial_start', 'paid_subscription', 'one_time_purchase'
  revenue_amount DECIMAL(10,2), -- $49.00
  currency TEXT DEFAULT 'USD',
  plan_name TEXT, -- 'Pro', 'Enterprise', etc.
  billing_interval TEXT, -- 'monthly', 'yearly'
  days_to_convert INTEGER, -- Time from signup to paid
  converted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversions_user ON attributed_conversions(user_id);
CREATE INDEX idx_conversions_signup ON attributed_conversions(signup_id);
CREATE INDEX idx_conversions_ambassador ON attributed_conversions(ambassador_id);
CREATE INDEX idx_conversions_workspace ON attributed_conversions(workspace_id);
CREATE INDEX idx_conversions_date ON attributed_conversions(converted_at DESC);
CREATE INDEX idx_conversions_type ON attributed_conversions(conversion_type);

-- 5. Ambassador Performance Stats (Aggregated view)
CREATE TABLE IF NOT EXISTS ambassador_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2), -- (signups / clicks) * 100
  signup_to_paid_rate DECIMAL(5,2), -- (conversions / signups) * 100
  avg_days_to_signup DECIMAL(5,2),
  avg_days_to_conversion DECIMAL(5,2),
  last_click_at TIMESTAMPTZ,
  last_signup_at TIMESTAMPTZ,
  last_conversion_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_ambassador_workspace_stats UNIQUE (ambassador_id, workspace_id)
);

CREATE INDEX idx_ambassador_stats_ambassador ON ambassador_stats(ambassador_id);
CREATE INDEX idx_ambassador_stats_workspace ON ambassador_stats(workspace_id);
CREATE INDEX idx_ambassador_stats_revenue ON ambassador_stats(total_revenue DESC);
CREATE INDEX idx_ambassador_stats_conversions ON ambassador_stats(total_conversions DESC);

-- 6. Daily Attribution Snapshots (For trending analysis)
CREATE TABLE IF NOT EXISTS attribution_daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  clicks_today INTEGER DEFAULT 0,
  signups_today INTEGER DEFAULT 0,
  conversions_today INTEGER DEFAULT 0,
  revenue_today DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_ambassador_date UNIQUE (ambassador_id, workspace_id, snapshot_date)
);

CREATE INDEX idx_daily_snapshots_ambassador ON attribution_daily_snapshots(ambassador_id);
CREATE INDEX idx_daily_snapshots_date ON attribution_daily_snapshots(snapshot_date DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referral_codes_updated_at BEFORE UPDATE ON referral_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ambassador_stats_updated_at BEFORE UPDATE ON ambassador_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update ambassador stats (called after click/signup/conversion)
CREATE OR REPLACE FUNCTION update_ambassador_stats_for_code(p_code TEXT)
RETURNS VOID AS $$
DECLARE
  v_ref_code_id UUID;
  v_ambassador_id UUID;
  v_workspace_id UUID;
BEGIN
  -- Get referral code details
  SELECT id, ambassador_id, workspace_id INTO v_ref_code_id, v_ambassador_id, v_workspace_id
  FROM referral_codes
  WHERE code = p_code;

  IF v_ref_code_id IS NULL THEN
    RETURN;
  END IF;

  -- Upsert stats
  INSERT INTO ambassador_stats (
    ambassador_id,
    workspace_id,
    referral_code,
    total_clicks,
    total_signups,
    total_conversions,
    total_revenue,
    conversion_rate,
    signup_to_paid_rate,
    avg_days_to_signup,
    avg_days_to_conversion,
    last_click_at,
    last_signup_at,
    last_conversion_at
  )
  SELECT
    v_ambassador_id,
    v_workspace_id,
    p_code,
    (SELECT COUNT(*) FROM referral_clicks WHERE referral_code_id = v_ref_code_id),
    (SELECT COUNT(*) FROM attributed_signups WHERE referral_code_id = v_ref_code_id),
    (SELECT COUNT(*) FROM attributed_conversions WHERE referral_code_id = v_ref_code_id),
    COALESCE((SELECT SUM(revenue_amount) FROM attributed_conversions WHERE referral_code_id = v_ref_code_id), 0),
    CASE
      WHEN (SELECT COUNT(*) FROM referral_clicks WHERE referral_code_id = v_ref_code_id) > 0
      THEN ((SELECT COUNT(*) FROM attributed_signups WHERE referral_code_id = v_ref_code_id)::DECIMAL /
            (SELECT COUNT(*) FROM referral_clicks WHERE referral_code_id = v_ref_code_id)::DECIMAL * 100)
      ELSE 0
    END,
    CASE
      WHEN (SELECT COUNT(*) FROM attributed_signups WHERE referral_code_id = v_ref_code_id) > 0
      THEN ((SELECT COUNT(*) FROM attributed_conversions WHERE referral_code_id = v_ref_code_id)::DECIMAL /
            (SELECT COUNT(*) FROM attributed_signups WHERE referral_code_id = v_ref_code_id)::DECIMAL * 100)
      ELSE 0
    END,
    (SELECT AVG(days_to_convert) FROM attributed_signups WHERE referral_code_id = v_ref_code_id),
    (SELECT AVG(days_to_convert) FROM attributed_conversions WHERE referral_code_id = v_ref_code_id),
    (SELECT MAX(clicked_at) FROM referral_clicks WHERE referral_code_id = v_ref_code_id),
    (SELECT MAX(signed_up_at) FROM attributed_signups WHERE referral_code_id = v_ref_code_id),
    (SELECT MAX(converted_at) FROM attributed_conversions WHERE referral_code_id = v_ref_code_id)
  ON CONFLICT (ambassador_id, workspace_id)
  DO UPDATE SET
    total_clicks = EXCLUDED.total_clicks,
    total_signups = EXCLUDED.total_signups,
    total_conversions = EXCLUDED.total_conversions,
    total_revenue = EXCLUDED.total_revenue,
    conversion_rate = EXCLUDED.conversion_rate,
    signup_to_paid_rate = EXCLUDED.signup_to_paid_rate,
    avg_days_to_signup = EXCLUDED.avg_days_to_signup,
    avg_days_to_conversion = EXCLUDED.avg_days_to_conversion,
    last_click_at = EXCLUDED.last_click_at,
    last_signup_at = EXCLUDED.last_signup_at,
    last_conversion_at = EXCLUDED.last_conversion_at,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (Row Level Security for multi-tenant)
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributed_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributed_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_daily_snapshots ENABLE ROW LEVEL SECURITY;

-- Note: Actual RLS policies would be added based on your auth setup
-- Example: Users can only see their own referral data
-- CREATE POLICY "Users can view their own referral codes" ON referral_codes
--   FOR SELECT USING (ambassador_id = auth.uid());
