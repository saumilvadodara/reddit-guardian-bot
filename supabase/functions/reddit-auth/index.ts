
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { action, code } = await req.json();
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const redirectUri = `${origin}/reddit-callback`;

    console.log('Reddit auth request:', { action, origin, redirectUri });

    const clientId = Deno.env.get('REDDIT_CLIENT_ID');
    const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Reddit client credentials not configured');
    }

    if (action === 'getAuthUrl') {
      // Comprehensive scopes for full moderator access
      const scopes = [
        'identity',          // Basic user info
        'read',             // Read posts and comments
        'modposts',         // Moderate posts (approve, remove, etc.)
        'modflair',         // Moderate flairs
        'modcontributors',  // Moderate contributors
        'modconfig',        // Moderate subreddit configuration
        'modothers',        // Other moderator permissions
        'modself',          // Moderate own posts
        'modwiki',          // Moderate wiki
        'modmail',          // Access to modmail
        'modlog',           // Access to moderation log
        'submit',           // Submit posts (sometimes needed for mod actions)
        'edit',             // Edit posts/comments (for mod actions)
        'vote',             // Vote on posts/comments
        'mysubreddits'      // Access to user's subreddits
      ].join(' ');

      const authUrl = `https://www.reddit.com/api/v1/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `state=random_string&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `duration=permanent&` +
        `scope=${encodeURIComponent(scopes)}`;

      console.log('Generated auth URL with comprehensive scopes:', authUrl);

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'exchangeCode') {
      console.log('Exchanging code for token...');

      const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ModBot:v1.0.0 (by /u/ModBotUser)',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          error: errorText
        });
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('Token exchange successful, received scopes:', tokenData.scope);

      return new Response(
        JSON.stringify({ accessToken: tokenData.access_token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Reddit auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
