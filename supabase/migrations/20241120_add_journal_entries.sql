-- Add journal_entries table
-- This table stores user journal entries and answers to strategic questions

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_workspace_id ON journal_entries(workspace_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_question_id ON journal_entries(question_id);

-- Add composite index for user + workspace queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_workspace
  ON journal_entries(user_id, workspace_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own journal entries
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (user_id = current_user);

-- Users can only insert their own journal entries
CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (user_id = current_user);

-- Users can only update their own journal entries
CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (user_id = current_user);

-- Users can only delete their own journal entries
CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (user_id = current_user);

-- Add updated_at trigger
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE journal_entries IS 'Stores user journal entries and answers to strategic questions';
