-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all access to chat_history" ON public.chat_history;
DROP POLICY IF EXISTS "Allow all access to user_preferences" ON public.user_preferences;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS public.idx_chat_history_user_id;
DROP INDEX IF EXISTS public.idx_chat_history_created_at;

-- Create table for storing chat history if not exists
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at DESC);

-- Create table for tracking user preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  favorite_foods TEXT[],
  disliked_foods TEXT[],
  exercise_preferences TEXT[],
  common_challenges TEXT[],
  successful_strategies TEXT[],
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all access to chat_history" ON public.chat_history FOR ALL USING (true);
CREATE POLICY "Allow all access to user_preferences" ON public.user_preferences FOR ALL USING (true);

-- Create or replace update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
