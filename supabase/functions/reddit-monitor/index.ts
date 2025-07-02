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

    // Get all active monitoring rules with user profiles to get Reddit tokens
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
        const response = await supabase.functions.invoke('openai-content-analysis', {
          body: { content, prompt }
        });

        if (response.error) {
          throw new Error(`OpenAI analysis failed: ${response.error.message}`);
        }

        return response.data;
      } catch (error) {
        console.error('Error calling OpenAI analysis:', error);
        return { flagged: false, reason: 'Analysis failed', confidence: 0 };
      }
    };

    // Helper function to fetch Reddit content with token
    const fetchRedditContent = async (subredditName: string, monitoringType: string, userId: string) => {
      try {
        // For now, we'll use mock data since we need to implement user token storage
        // In a real implementation, you would get the user's Reddit token from the database
        console.log(`Mock fetching ${monitoringType} from r/${subredditName} for user ${userId}`);
        
        // Call the reddit-api function to get content (will fall back to mock data)
        const response = await supabase.functions.invoke('reddit-api', {
          body: { 
            action: 'get_content',
            subreddit: subredditName,
            content_type: monitoringType,
            limit: 10 // Get last 10 items
          }
        });

        if (response.error) {
          console.error(`Error fetching Reddit content for r/${subredditName}:`, response.error);
          return [];
        }

        return response.data?.content || [];
      } catch (error) {
        console.error(`Error fetching Reddit content for r/${subredditName}:`, error);
        return [];
      }
    };

    // Process each monitoring rule
    for (const rule of monitoringRules) {
      try {
        console.log(`Processing rule: ${rule.name} for subreddit: ${rule.communities?.subreddit_name}`);

        // Fetch Reddit content (currently mock data)
        const redditContent = await fetchRedditContent(
          rule.communities?.subreddit_name,
          rule.monitoring_type,
          rule.communities?.user_id
        );

        console.log(`Found ${redditContent.length} ${rule.monitoring_type} in r/${rule.communities?.subreddit_name}`);

        // Process each piece of content
        for (const content of redditContent) {
          let shouldCreateAlert = false;
          let alertReason = '';
          let contentText = '';

          // Extract text based on content type
          if (rule.monitoring_type === 'posts') {
            contentText = `${content.title || ''} ${content.selftext || ''}`.trim();
          } else if (rule.monitoring_type === 'comments') {
            contentText = content.body || '';
          }

          if (!contentText) {
            console.log(`No text content found for ${rule.monitoring_type}`);
            continue;
          }

          console.log(`Analyzing content: "${contentText.substring(0, 100)}..."`);

          if (rule.use_openai && rule.openai_prompt) {
            // Use OpenAI analysis
            console.log(`Using OpenAI analysis for rule: ${rule.name}`);
            const analysis = await analyzeWithOpenAI(contentText, rule.openai_prompt);
            
            console.log('OpenAI analysis result:', analysis);
            
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
              contentText.toLowerCase().includes(keyword.toLowerCase())
            );

            if (hasMatchingKeyword) {
              shouldCreateAlert = true;
              alertReason = `Keyword match detected: ${rule.keywords.join(', ')}`;
            }
          }

          if (shouldCreateAlert) {
            // Check if we already created an alert for this specific content
            const contentId = content.id || content.name;
            const { data: existingAlert } = await supabase
              .from('alerts')
              .select('id')
              .eq('monitoring_rule_id', rule.id)
              .eq(rule.monitoring_type === 'posts' ? 'reddit_post_id' : 'reddit_comment_id', contentId)
              .single();

            if (!existingAlert) {
              const alertData = {
                user_id: rule.user_id,
                community_id: rule.community_id,
                monitoring_rule_id: rule.id,
                title: rule.use_openai ? `AI flagged ${rule.monitoring_type.slice(0, -1)} in r/${rule.communities?.subreddit_name}` : `Keyword match in r/${rule.communities?.subreddit_name}`,
                description: `${alertReason}\n\nContent: "${contentText.substring(0, 200)}${contentText.length > 200 ? '...' : ''}"`,
                severity: rule.use_openai ? 'high' : 'medium',
                is_read: false,
                [rule.monitoring_type === 'posts' ? 'reddit_post_id' : 'reddit_comment_id']: contentId
              };

              const { error: alertError } = await supabase
                .from('alerts')
                .insert(alertData);

              if (alertError) {
                console.error('Error creating alert:', alertError);
              } else {
                console.log(`Created alert for rule: ${rule.name}, content: ${contentId}`);
                totalAlertsCreated++;
              }
            } else {
              console.log(`Alert already exists for rule: ${rule.name}, content: ${contentId}`);
            }
          } else {
            console.log(`No violations detected for content in rule: ${rule.name}`);
          }
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
