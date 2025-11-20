-- Opportunities System Tables
-- For event discovery and podcast outreach tracking

-- Saved Events
CREATE TABLE IF NOT EXISTS saved_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'conference', 'webinar', 'hackathon', 'meetup', 'summit'
  date DATE,
  location TEXT,
  website TEXT,
  description TEXT,
  expected_attendees TEXT,
  key_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  speakers TEXT[] DEFAULT ARRAY[]::TEXT[],
  ticket_price TEXT,
  sponsorship_available BOOLEAN DEFAULT false,
  estimated_sponsorship_cost TEXT,
  cfp_deadline DATE,
  relevance_score INTEGER DEFAULT 0, -- 0-100
  why_attend TEXT,
  networking_opportunities TEXT,
  recommended_action TEXT, -- 'Attend', 'Sponsor', 'Speak', 'Skip'
  attendance_status TEXT DEFAULT 'considering', -- 'considering', 'registered', 'attended', 'passed'
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_events_workspace ON saved_events(workspace_id);
CREATE INDEX idx_saved_events_date ON saved_events(date);
CREATE INDEX idx_saved_events_event_type ON saved_events(event_type);
CREATE INDEX idx_saved_events_relevance ON saved_events(relevance_score DESC);
CREATE INDEX idx_saved_events_status ON saved_events(attendance_status);

-- Saved Podcasts
CREATE TABLE IF NOT EXISTS saved_podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  host TEXT,
  description TEXT,
  website TEXT,
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['Spotify', 'Apple Podcasts', 'YouTube']
  episode_count INTEGER DEFAULT 0,
  release_frequency TEXT,
  average_length TEXT,
  estimated_listeners TEXT,
  guest_format BOOLEAN DEFAULT false,
  recent_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  typical_guest_profile TEXT,
  audience_description TEXT,
  fit_score INTEGER DEFAULT 0, -- 0-100
  why_you_fit TEXT,
  pitch_strategy TEXT,
  contact_email TEXT,
  contact_twitter TEXT,
  contact_linkedin TEXT,
  guest_application_url TEXT,
  outreach_status TEXT DEFAULT 'not_contacted', -- 'not_contacted', 'pitched', 'scheduled', 'published', 'passed'
  pitch_sent_date DATE,
  scheduled_date DATE,
  published_date DATE,
  episode_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_podcasts_workspace ON saved_podcasts(workspace_id);
CREATE INDEX idx_saved_podcasts_fit_score ON saved_podcasts(fit_score DESC);
CREATE INDEX idx_saved_podcasts_status ON saved_podcasts(outreach_status);
CREATE INDEX idx_saved_podcasts_guest_format ON saved_podcasts(guest_format);

-- Event Reminders
CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_event_id UUID NOT NULL REFERENCES saved_events(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  reminder_date DATE NOT NULL,
  reminder_type TEXT NOT NULL, -- 'registration_deadline', 'cfp_deadline', 'event_date', 'custom'
  message TEXT,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_reminders_event ON event_reminders(saved_event_id);
CREATE INDEX idx_event_reminders_date ON event_reminders(reminder_date);
CREATE INDEX idx_event_reminders_sent ON event_reminders(sent);

-- Podcast Outreach Notes
CREATE TABLE IF NOT EXISTS podcast_outreach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_podcast_id UUID NOT NULL REFERENCES saved_podcasts(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  note_type TEXT NOT NULL, -- 'pitch_draft', 'response', 'follow_up', 'general'
  content TEXT NOT NULL,
  created_by TEXT, -- User who created the note
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_podcast_outreach_notes_podcast ON podcast_outreach_notes(saved_podcast_id);
CREATE INDEX idx_podcast_outreach_notes_type ON podcast_outreach_notes(note_type);
CREATE INDEX idx_podcast_outreach_notes_created ON podcast_outreach_notes(created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_events_updated_at BEFORE UPDATE ON saved_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_podcasts_updated_at BEFORE UPDATE ON saved_podcasts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security for multi-tenant)
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_outreach_notes ENABLE ROW LEVEL SECURITY;

-- Note: Actual RLS policies would be added based on your auth setup
-- Example policy structure (adjust based on your auth.users setup):
-- CREATE POLICY "Users can view their workspace data" ON saved_events
--   FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
-- CREATE POLICY "Users can insert their workspace data" ON saved_events
--   FOR INSERT WITH CHECK (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
-- CREATE POLICY "Users can update their workspace data" ON saved_events
--   FOR UPDATE USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
-- CREATE POLICY "Users can delete their workspace data" ON saved_events
--   FOR DELETE USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

-- Same pattern for saved_podcasts, event_reminders, and podcast_outreach_notes
