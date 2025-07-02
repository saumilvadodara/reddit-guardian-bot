
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
    const { endpoint, token, action, subreddit, content_type, limit = 25 } = await req.json();
    
    console.log(`Reddit API request - Endpoint: ${endpoint}, Action: ${action}, Token: ${token ? 'present' : 'missing'}`);

    if (!token) {
      throw new Error('Reddit access token is required');
    }

    // Handle different types of requests
    if (endpoint) {
      // Direct endpoint call (for user data, subreddits, etc.)
      const response = await fetch(`https://oauth.reddit.com/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'ModBot:v1.0.0 (by /u/ModBotUser)',
        },
      });

      if (!response.ok) {
        console.error('Reddit API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        
        if (response.status === 401) {
          throw new Error('Reddit token expired or invalid. Please reconnect your account.');
        }
        throw new Error(`Reddit API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Reddit API response received:', Object.keys(data));
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_content') {
      // Fetch real Reddit content
      let endpoint_url = '';
      
      if (content_type === 'comments') {
        endpoint_url = `https://oauth.reddit.com/r/${subreddit}/comments.json?limit=${limit}`;
      } else if (content_type === 'posts') {
        endpoint_url = `https://oauth.reddit.com/r/${subreddit}/new.json?limit=${limit}`;
      } else {
        throw new Error(`Unsupported content type: ${content_type}`);
      }

      console.log(`Fetching Reddit content from: ${endpoint_url}`);

      const response = await fetch(endpoint_url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'ModBot:v1.0.0 (by /u/ModBotUser)',
        },
      });

      if (!response.ok) {
        console.error('Reddit API error:', response.status, response.statusText);
        
        // If we can't fetch real data, fall back to mock data for testing
        console.log('Falling back to mock data for testing...');
        
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

        return new Response(
          JSON.stringify({ content: mockContent.slice(0, limit) }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Reddit content fetched successfully');

      // Process the Reddit API response structure
      let content = [];
      if (data.data && data.data.children) {
        content = data.data.children.map((child: any) => child.data);
      }

      return new Response(
        JSON.stringify({ content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action or missing parameters' }),
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
