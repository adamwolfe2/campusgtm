-- Campus GTM Database Schema
-- Initial migration to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategy modules table
CREATE TABLE IF NOT EXISTS public.strategy_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_module_type CHECK (
    type IN ('ambassador_program', 'content_calendar', 'icp_definition', 'outreach_scripts', 'virality_engine')
  )
);

-- Blocks table
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.strategy_modules(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_block_type CHECK (
    type IN ('text', 'heading_1', 'heading_2', 'heading_3', 'bullet_list', 'checklist', 'quote', 'ai_block')
  )
);

-- Onboarding data table
CREATE TABLE IF NOT EXISTS public.onboarding_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  scraped_website JSONB,
  uploaded_documents JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated strategies table (stores AI-generated strategy JSON)
CREATE TABLE IF NOT EXISTS public.generated_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  strategy JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON public.workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_modules_workspace_id ON public.strategy_modules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_blocks_module_id ON public.blocks(module_id);
CREATE INDEX IF NOT EXISTS idx_blocks_position ON public.blocks(module_id, position);
CREATE INDEX IF NOT EXISTS idx_onboarding_data_workspace_id ON public.onboarding_data(workspace_id);
CREATE INDEX IF NOT EXISTS idx_generated_strategies_workspace_id ON public.generated_strategies(workspace_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_strategies ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Workspaces policies
CREATE POLICY "Users can view own workspaces"
  ON public.workspaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspaces"
  ON public.workspaces FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workspaces"
  ON public.workspaces FOR DELETE
  USING (auth.uid() = user_id);

-- Strategy modules policies
CREATE POLICY "Users can view modules in own workspaces"
  ON public.strategy_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = strategy_modules.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create modules in own workspaces"
  ON public.strategy_modules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update modules in own workspaces"
  ON public.strategy_modules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = strategy_modules.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete modules in own workspaces"
  ON public.strategy_modules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = strategy_modules.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Blocks policies (inherits from strategy_modules)
CREATE POLICY "Users can view blocks in own modules"
  ON public.blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.strategy_modules
      JOIN public.workspaces ON workspaces.id = strategy_modules.workspace_id
      WHERE strategy_modules.id = blocks.module_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create blocks in own modules"
  ON public.blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.strategy_modules
      JOIN public.workspaces ON workspaces.id = strategy_modules.workspace_id
      WHERE strategy_modules.id = module_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update blocks in own modules"
  ON public.blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.strategy_modules
      JOIN public.workspaces ON workspaces.id = strategy_modules.workspace_id
      WHERE strategy_modules.id = blocks.module_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete blocks in own modules"
  ON public.blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.strategy_modules
      JOIN public.workspaces ON workspaces.id = strategy_modules.workspace_id
      WHERE strategy_modules.id = blocks.module_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Onboarding data policies
CREATE POLICY "Users can view onboarding data for own workspaces"
  ON public.onboarding_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = onboarding_data.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create onboarding data for own workspaces"
  ON public.onboarding_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Generated strategies policies
CREATE POLICY "Users can view strategies for own workspaces"
  ON public.generated_strategies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = generated_strategies.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create strategies for own workspaces"
  ON public.generated_strategies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategy_modules_updated_at BEFORE UPDATE ON public.strategy_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON public.blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_data_updated_at BEFORE UPDATE ON public.onboarding_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_strategies_updated_at BEFORE UPDATE ON public.generated_strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
