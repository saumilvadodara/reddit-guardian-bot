
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

    const { action, subreddit, content_type, limit = 25 } = await req.json();
    
    console.log(`Reddit API request - Action: ${action}, Subreddit: ${subreddit}, Type: ${content_type}`);

    // For now, we'll simulate Reddit content since we need Reddit API credentials
    // In a real implementation, you would use Reddit's API with proper authentication
    
    if (action === 'get_content') {
      // Simulate different types of content for testing
      let mockContent = [];
      
      if (content_type === 'comments') {
        mockContent = [
          {
            id: 'comment_1',
            name: 't1_comment_1',
            body: 'This is a rude comment that should be flagged by AI. You are stupid and your post is garbage.',
            author: 'test_user_1',
            created_utc: Date.now() / 1000,
            subreddit: subreddit
          },
          {
            id: 'comment_2', 
            name: 't1_comment_2',
            body: 'Another potentially rude comment. Your idea is terrible and makes no sense at all.',
            author: 'test_user_2',
            created_utc: Date.now() / 1000,
            subreddit: subreddit
          },
          {
            id: 'comment_3',
            name: 't1_comment_3', 
            body: 'This is a normal, polite comment that should not be flagged.',
            author: 'test_user_3',
            created_utc: Date.now() / 1000,
            subreddit: subreddit
          }
        ];
      } else if (content_type === 'posts') {
        mockContent = [
          {
            id: 'post_1',
            name: 't3_post_1',
            title: 'This is a rude post title',
            selftext: 'This post contains rude language and should be flagged. Everyone here is an idiot.',
            author: 'test_user_1',
            created_utc: Date.now() / 1000,
            subreddit: subreddit
          },
          {
            id: 'post_2',
            name: 't3_post_2', 
            title: 'Normal post title',
            selftext: 'This is a normal post that should not be flagged by the AI system.',
            author: 'test_user_2',
            created_utc: Date.now() / 1000,
            subreddit: subreddit
          }
        ];
      }

      console.log(`Returning ${mockContent.length} mock ${content_type} for testing`);

      return new Response(
        JSON.stringify({ content: mockContent.slice(0, limit) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Reddit API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
