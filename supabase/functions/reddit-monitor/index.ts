
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting Reddit monitoring process...');

    // Get all active monitoring rules
    const { data: monitoringRules, error: rulesError } = await supabase
      .from('monitoring_rules')
      .select(`
        *,
        communities (
          subreddit_name,
          user_id
        )
      `)
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching monitoring rules:', rulesError);
      throw rulesError;
    }

    console.log(`Found ${monitoringRules?.length || 0} active monitoring rules`);

    if (!monitoringRules || monitoringRules.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active monitoring rules found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalAlertsCreated = 0;

    // Helper function to analyze content with OpenAI
    const analyzeWithOpenAI = async (content: string, prompt: string) => {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/openai-content-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ content, prompt }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI analysis failed: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error calling OpenAI analysis:', error);
        return { flagged: false, reason: 'Analysis failed', confidence: 0 };
      }
    };

    // Process each monitoring rule
    for (const rule of monitoringRules) {
      try {
        console.log(`Processing rule: ${rule.name} for subreddit: ${rule.communities?.subreddit_name}`);

        // Get user's Reddit token (you'll need to store this in user_profiles or separate table)
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', rule.communities?.user_id)
          .single();

        if (profileError || !userProfile) {
          console.log(`No user profile found for rule ${rule.name}, skipping...`);
          continue;
        }

        // For demonstration, create sample content to analyze
        const sampleContent = `Check out this amazing deal on our new product! Get 50% off with code SAVE50. Limited time offer! Click the link in my bio to order now. This is totally not spam, I'm just sharing a great opportunity with the community.`;

        let shouldCreateAlert = false;
        let alertReason = '';

        if (rule.use_openai && rule.openai_prompt) {
          // Use OpenAI analysis
          console.log(`Using OpenAI analysis for rule: ${rule.name}`);
          const analysis = await analyzeWithOpenAI(sampleContent, rule.openai_prompt);
          
          if (analysis.flagged && analysis.confidence > 0.5) {
            shouldCreateAlert = true;
            alertReason = `AI Analysis: ${analysis.reason}`;
          }
        } else {
          // Use keyword matching
          if (!rule.keywords || rule.keywords.length === 0) {
            console.log(`No keywords found for rule ${rule.name}, skipping...`);
            continue;
          }

          const hasMatchingKeyword = rule.keywords.some(keyword => 
            sampleContent.toLowerCase().includes(keyword.toLowerCase())
          );

          if (hasMatchingKeyword) {
            shouldCreateAlert = true;
            alertReason = `Keyword match detected: ${rule.keywords.join(', ')}`;
          }
        }

        if (shouldCreateAlert) {
          // Check if we already created an alert recently (to avoid duplicates)
          const { data: existingAlert } = await supabase
            .from('alerts')
            .select('id')
            .eq('monitoring_rule_id', rule.id)
            .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
            .single();

          if (!existingAlert) {
            const alertData = {
              user_id: rule.user_id,
              community_id: rule.community_id,
              monitoring_rule_id: rule.id,
              title: rule.use_openai ? `AI flagged content in rule: ${rule.name}` : `Keyword match detected: ${rule.name}`,
              description: `A ${rule.monitoring_type} in r/${rule.communities?.subreddit_name} was flagged by monitoring rule "${rule.name}". ${alertReason}`,
              severity: rule.use_openai ? 'high' : 'medium',
              is_read: false
            };

            const { error: alertError } = await supabase
              .from('alerts')
              .insert(alertData);

            if (alertError) {
              console.error('Error creating alert:', alertError);
            } else {
              console.log(`Created alert for rule: ${rule.name}`);
              totalAlertsCreated++;
            }
          } else {
            console.log(`Alert already exists for rule: ${rule.name}`);
          }
        } else {
          console.log(`No violations detected for rule: ${rule.name}`);
        }

      } catch (error) {
        console.error(`Error processing rule ${rule.name}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Monitoring completed. Created ${totalAlertsCreated} new alerts.`,
        totalRulesProcessed: monitoringRules.length,
        totalAlertsCreated 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reddit monitoring error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
