-- Intelligence System Tables
-- For keyword monitoring, community finding, and competitive intelligence

-- Monitored Keywords
CREATE TABLE IF NOT EXISTS monitored_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  platforms TEXT[] DEFAULT ARRAY['reddit', 'hackernews', 'web'],
  alert_threshold INTEGER DEFAULT 5, -- Min engagement score to alert
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workspace_keyword UNIQUE (workspace_id, keyword)
);

CREATE INDEX idx_monitored_keywords_workspace ON monitored_keywords(workspace_id);
CREATE INDEX idx_monitored_keywords_active ON monitored_keywords(is_active);

-- Keyword Mentions (findings from monitoring)
CREATE TABLE IF NOT EXISTS keyword_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES monitored_keywords(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'reddit', 'hackernews', 'web'
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  author TEXT,
  relevance_score INTEGER DEFAULT 0, -- 0-100 AI-scored relevance
  engagement_score INTEGER DEFAULT 0, -- Upvotes, comments, etc.
  status TEXT DEFAULT 'new', -- 'new', 'viewed', 'replied', 'dismissed'
  suggested_reply TEXT, -- AI-generated reply suggestion
  metadata JSONB DEFAULT '{}', -- Platform-specific data
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keyword_mentions_keyword ON keyword_mentions(keyword_id);
CREATE INDEX idx_keyword_mentions_platform ON keyword_mentions(platform);
CREATE INDEX idx_keyword_mentions_status ON keyword_mentions(status);
CREATE INDEX idx_keyword_mentions_detected ON keyword_mentions(detected_at DESC);

-- ICP Communities
CREATE TABLE IF NOT EXISTS icp_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'reddit', 'linkedin', 'discord', 'slack', 'facebook', 'other'
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  member_count INTEGER,
  activity_score INTEGER DEFAULT 0, -- 0-100 based on posts/day
  relevance_score INTEGER DEFAULT 0, -- 0-100 AI-scored relevance to ICP
  engagement_strategy TEXT, -- AI-generated guidance
  rules TEXT, -- Community rules/guidelines
  best_posting_times TEXT, -- Recommended times to post
  status TEXT DEFAULT 'discovered', -- 'discovered', 'joined', 'active', 'archived'
  metadata JSONB DEFAULT '{}',
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workspace_community UNIQUE (workspace_id, url)
);

CREATE INDEX idx_icp_communities_workspace ON icp_communities(workspace_id);
CREATE INDEX idx_icp_communities_platform ON icp_communities(platform);
CREATE INDEX idx_icp_communities_relevance ON icp_communities(relevance_score DESC);
CREATE INDEX idx_icp_communities_status ON icp_communities(status);

-- Competitors
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  website TEXT NOT NULL,
  description TEXT,
  tracked_urls TEXT[] DEFAULT ARRAY[]::TEXT[], -- URLs to monitor
  social_accounts JSONB DEFAULT '{}', -- { twitter: '@handle', linkedin: 'url' }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workspace_competitor UNIQUE (workspace_id, website)
);

CREATE INDEX idx_competitors_workspace ON competitors(workspace_id);
CREATE INDEX idx_competitors_active ON competitors(is_active);

-- Competitor Snapshots (for change detection)
CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  content_hash TEXT NOT NULL, -- MD5 hash for quick comparison
  content TEXT, -- Full page content
  metadata JSONB DEFAULT '{}',
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitor_snapshots_competitor ON competitor_snapshots(competitor_id);
CREATE INDEX idx_competitor_snapshots_scraped ON competitor_snapshots(scraped_at DESC);

-- Competitor Changes (detected differences)
CREATE TABLE IF NOT EXISTS competitor_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  change_type TEXT NOT NULL, -- 'pricing', 'feature', 'content', 'design', 'other'
  summary TEXT NOT NULL, -- AI-generated summary of change
  old_content TEXT,
  new_content TEXT,
  impact_score INTEGER DEFAULT 0, -- 0-100 how important is this change
  status TEXT DEFAULT 'new', -- 'new', 'reviewed', 'actioned'
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitor_changes_competitor ON competitor_changes(competitor_id);
CREATE INDEX idx_competitor_changes_detected ON competitor_changes(detected_at DESC);
CREATE INDEX idx_competitor_changes_status ON competitor_changes(status);

-- Viral Content (trending content in user's niche)
CREATE TABLE IF NOT EXISTS viral_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'reddit', 'hackernews', 'producthunt', 'twitter'
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  author TEXT,
  engagement_score INTEGER DEFAULT 0, -- Upvotes, points, etc.
  why_viral TEXT, -- AI analysis of why it went viral
  content_ideas TEXT[], -- AI-generated similar ideas
  status TEXT DEFAULT 'new', -- 'new', 'reviewed', 'used'
  metadata JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_viral_content_workspace ON viral_content(workspace_id);
CREATE INDEX idx_viral_content_platform ON viral_content(platform);
CREATE INDEX idx_viral_content_engagement ON viral_content(engagement_score DESC);
CREATE INDEX idx_viral_content_detected ON viral_content(detected_at DESC);

-- Daily Actions (prioritized to-do list)
CREATE TABLE IF NOT EXISTS daily_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  action_type TEXT NOT NULL, -- 'engage_thread', 'publish_content', 'monitor_competitor', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_score INTEGER DEFAULT 0, -- 0-100 expected impact
  effort_minutes INTEGER DEFAULT 30, -- Estimated time
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
  source_id UUID, -- ID of the mention/content/change that triggered this
  source_type TEXT, -- 'keyword_mention', 'viral_content', 'competitor_change'
  roi_actual INTEGER, -- User-reported actual impact after completion
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_actions_workspace ON daily_actions(workspace_id);
CREATE INDEX idx_daily_actions_date ON daily_actions(date DESC);
CREATE INDEX idx_daily_actions_status ON daily_actions(status);
CREATE INDEX idx_daily_actions_impact ON daily_actions(impact_score DESC);

-- Weekly Digests
CREATE TABLE IF NOT EXISTS weekly_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  summary_json JSONB NOT NULL, -- { top_mentions, new_communities, competitor_moves, etc. }
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workspace_week UNIQUE (workspace_id, week_start)
);

CREATE INDEX idx_weekly_digests_workspace ON weekly_digests(workspace_id);
CREATE INDEX idx_weekly_digests_week ON weekly_digests(week_start DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_monitored_keywords_updated_at BEFORE UPDATE ON monitored_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON competitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security for multi-tenant)
ALTER TABLE monitored_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE icp_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_digests ENABLE ROW LEVEL SECURITY;

-- Note: Actual RLS policies would be added based on your auth setup
-- Example policy structure (adjust based on your auth.users setup):
-- CREATE POLICY "Users can view their workspace data" ON monitored_keywords
--   FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
