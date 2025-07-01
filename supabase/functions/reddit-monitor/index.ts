
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

        // For now, we'll create a sample alert to demonstrate the functionality
        // In a real implementation, you would:
        // 1. Use the stored Reddit token to fetch recent posts/comments
        // 2. Check if they match the keywords
        // 3. Create alerts for matches

        // Check if we have keywords to monitor
        if (!rule.keywords || rule.keywords.length === 0) {
          console.log(`No keywords found for rule ${rule.name}, skipping...`);
          continue;
        }

        // Create a sample alert for demonstration
        // This would be replaced with actual Reddit API calls
        const alertData = {
          user_id: rule.user_id,
          community_id: rule.community_id,
          monitoring_rule_id: rule.id,
          title: `Keyword match detected: ${rule.keywords[0]}`,
          description: `A ${rule.monitoring_type} in r/${rule.communities?.subreddit_name} matched your monitoring rule "${rule.name}". Keywords: ${rule.keywords.join(', ')}`,
          severity: 'medium',
          is_read: false
        };

        // Check if we already created an alert recently (to avoid duplicates)
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('monitoring_rule_id', rule.id)
          .eq('title', alertData.title)
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
          .single();

        if (!existingAlert) {
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
