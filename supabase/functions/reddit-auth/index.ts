
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
    
    const clientId = Deno.env.get('REDDIT_CLIENT_ID');
    const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET');
    
    // Use the origin from the request to construct the redirect URI
    const origin = req.headers.get('origin') || 'https://reddit-guardian-bot.lovable.app';
    const redirectUri = `${origin}/reddit-callback`;

    console.log('Reddit auth request:', { action, origin, redirectUri });

    if (!clientId || !clientSecret) {
      throw new Error('Reddit credentials not configured');
    }

    if (action === 'getAuthUrl') {
      const authUrl = `https://www.reddit.com/api/v1/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `state=random_string&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `duration=permanent&` +
        `scope=identity read modposts modflair modcontributors`;

      console.log('Generated auth URL:', authUrl);

      return new Response(
        JSON.stringify({ authUrl }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (action === 'exchangeCode') {
      console.log('Exchanging code for token...');
      
      const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ModBot/1.0'
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error('Token exchange error:', tokenData);
        throw new Error(tokenData.error || 'Failed to exchange code for token');
      }

      console.log('Token exchange successful');

      return new Response(
        JSON.stringify({ accessToken: tokenData.access_token }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Reddit auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
