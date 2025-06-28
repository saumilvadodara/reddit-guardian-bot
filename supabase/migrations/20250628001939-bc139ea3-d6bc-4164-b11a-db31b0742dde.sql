
-- Create enum types for better data integrity
CREATE TYPE public.subreddit_status AS ENUM ('active', 'paused', 'archived');
CREATE TYPE public.monitoring_type AS ENUM ('posts', 'comments', 'modqueue', 'reports');
CREATE TYPE public.notification_type AS ENUM ('email', 'in_app', 'webhook');
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.schedule_frequency AS ENUM ('hourly', 'daily', 'weekly', 'monthly');

-- User profiles table to store Reddit user data
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  reddit_username TEXT NOT NULL,
  reddit_id TEXT NOT NULL,
  is_mod BOOLEAN DEFAULT false,
  total_karma INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Communities/Subreddits table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  subreddit_name TEXT NOT NULL,
  subreddit_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  subscribers INTEGER DEFAULT 0,
  is_moderator BOOLEAN DEFAULT false,
  status subreddit_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subreddit_name)
);

-- Monitoring rules table
CREATE TABLE public.monitoring_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  community_id UUID REFERENCES public.communities NOT NULL,
  name TEXT NOT NULL,
  monitoring_type monitoring_type NOT NULL,
  keywords TEXT[], -- Array of keywords to monitor
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  community_id UUID REFERENCES public.communities NOT NULL,
  monitoring_rule_id UUID REFERENCES public.monitoring_rules,
  title TEXT NOT NULL,
  description TEXT,
  severity alert_severity DEFAULT 'medium',
  reddit_post_id TEXT,
  reddit_comment_id TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Schedules table
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  community_id UUID REFERENCES public.communities,
  name TEXT NOT NULL,
  description TEXT,
  frequency schedule_frequency NOT NULL,
  next_run TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications settings table
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  notification_type notification_type NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  webhook_url TEXT,
  email_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for communities
CREATE POLICY "Users can view their own communities" ON public.communities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own communities" ON public.communities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own communities" ON public.communities
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for monitoring_rules
CREATE POLICY "Users can view their own monitoring rules" ON public.monitoring_rules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own monitoring rules" ON public.monitoring_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own monitoring rules" ON public.monitoring_rules
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own monitoring rules" ON public.monitoring_rules
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for alerts
CREATE POLICY "Users can view their own alerts" ON public.alerts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own alerts" ON public.alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.alerts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for schedules
CREATE POLICY "Users can view their own schedules" ON public.schedules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own schedules" ON public.schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own schedules" ON public.schedules
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own schedules" ON public.schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for notification_settings
CREATE POLICY "Users can view their own notification settings" ON public.notification_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification settings" ON public.notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification settings" ON public.notification_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notification settings" ON public.notification_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamp
CREATE TRIGGER handle_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_communities
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_monitoring_rules
  BEFORE UPDATE ON public.monitoring_rules
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_schedules
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_notification_settings
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
