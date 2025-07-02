
-- Add OpenAI integration fields to monitoring_rules table
ALTER TABLE public.monitoring_rules 
ADD COLUMN use_openai BOOLEAN DEFAULT FALSE,
ADD COLUMN openai_prompt TEXT;

-- Update the monitoring_rules table to make keywords optional when using OpenAI
ALTER TABLE public.monitoring_rules 
ALTER COLUMN keywords DROP NOT NULL;
