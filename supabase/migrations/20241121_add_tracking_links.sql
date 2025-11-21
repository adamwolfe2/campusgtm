-- Migration: Add Tracking Links for Ambassador Program
-- Description: Creates tables for tracking ambassador referral links and signups
-- Created: 2024-11-21

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: tracking_links
-- Stores unique tracking links for ambassadors
CREATE TABLE IF NOT EXISTS tracking_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  ambassador_program_id UUID,
  short_code VARCHAR(20) NOT NULL UNIQUE,
  full_url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key to strategy_modules (ambassador programs)
  CONSTRAINT fk_ambassador_program
    FOREIGN KEY (ambassador_program_id)
    REFERENCES strategy_modules(id)
    ON DELETE SET NULL
);

-- Table: link_clicks
-- Tracks individual clicks on tracking links
CREATE TABLE IF NOT EXISTS link_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  link_id UUID NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key to tracking_links
  CONSTRAINT fk_tracking_link
    FOREIGN KEY (link_id)
    REFERENCES tracking_links(id)
    ON DELETE CASCADE
);

-- Table: link_signups
-- Tracks successful signups/conversions from tracking links
CREATE TABLE IF NOT EXISTS link_signups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  link_id UUID NOT NULL,
  email VARCHAR(255),
  full_name VARCHAR(255),
  metadata JSONB,
  signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key to tracking_links
  CONSTRAINT fk_tracking_link_signup
    FOREIGN KEY (link_id)
    REFERENCES tracking_links(id)
    ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracking_links_user_id ON tracking_links(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_short_code ON tracking_links(short_code);
CREATE INDEX IF NOT EXISTS idx_tracking_links_ambassador_program ON tracking_links(ambassador_program_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_link_signups_link_id ON link_signups(link_id);
CREATE INDEX IF NOT EXISTS idx_link_signups_signed_up_at ON link_signups(signed_up_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tracking_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_tracking_links_updated_at
  BEFORE UPDATE ON tracking_links
  FOR EACH ROW
  EXECUTE FUNCTION update_tracking_links_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_signups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tracking_links
-- Users can view their own tracking links
CREATE POLICY "Users can view own tracking links"
  ON tracking_links FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own tracking links
CREATE POLICY "Users can insert own tracking links"
  ON tracking_links FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own tracking links
CREATE POLICY "Users can update own tracking links"
  ON tracking_links FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own tracking links
CREATE POLICY "Users can delete own tracking links"
  ON tracking_links FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policies for link_clicks
-- Users can view clicks for their links
CREATE POLICY "Users can view own link clicks"
  ON link_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tracking_links
      WHERE tracking_links.id = link_clicks.link_id
      AND tracking_links.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Anyone can insert link clicks (for tracking purposes)
CREATE POLICY "Anyone can insert link clicks"
  ON link_clicks FOR INSERT
  WITH CHECK (true);

-- RLS Policies for link_signups
-- Users can view signups for their links
CREATE POLICY "Users can view own link signups"
  ON link_signups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tracking_links
      WHERE tracking_links.id = link_signups.link_id
      AND tracking_links.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Anyone can insert link signups (for tracking purposes)
CREATE POLICY "Anyone can insert link signups"
  ON link_signups FOR INSERT
  WITH CHECK (true);

-- Users can update signups for their links
CREATE POLICY "Users can update own link signups"
  ON link_signups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tracking_links
      WHERE tracking_links.id = link_signups.link_id
      AND tracking_links.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
