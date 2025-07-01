
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
    const { endpoint, token, params = {} } = await req.json();

    if (!token) {
      throw new Error('Reddit access token required');
    }

    const baseUrl = 'https://oauth.reddit.com';
    let url = `${baseUrl}/${endpoint}`;

    // Add query parameters if provided
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    console.log(`Making Reddit API call to: ${url}`);
    console.log(`Using token: ${token.substring(0, 10)}...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'ModBot:v1.0.0 (by /u/ModBotUser)',
        'Accept': 'application/json'
      }
    });

    console.log(`Reddit API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit API error response:', errorText);
      
      // Handle specific error cases
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: 'Reddit authentication failed - token may be expired. Please reconnect your Reddit account.',
            needsReauth: true 
          }),
          { 
            status: 200, // Return 200 to prevent edge function error
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 403) {
        // For 403 errors, check if it's the moderator endpoint
        if (endpoint.includes('moderator') || endpoint.includes('mine/moderator')) {
          console.log('403 error on moderator endpoint - user may not have moderator permissions');
          return new Response(
            JSON.stringify({ 
              data: { children: [] }, // Return empty array structure
              error: null,
              message: 'No moderated communities found. This could mean: 1) You are not a moderator of any subreddits, 2) You need to reconnect with updated permissions, or 3) Your Reddit app needs additional configuration.'
            }),
            { 
              status: 200, // Return 200 to prevent edge function error
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: 'Access forbidden - insufficient permissions. Please reconnect your Reddit account with updated permissions.',
            needsReauth: true 
          }),
          { 
            status: 200, // Return 200 to prevent edge function error
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // For other errors, still return 200 to prevent edge function failures
      return new Response(
        JSON.stringify({ 
          error: `Reddit API error: ${response.status} - ${errorText}`,
          status: response.status 
        }),
        { 
          status: 200, // Return 200 to prevent edge function error
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Reddit API response received successfully');

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Reddit API edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 200, // Return 200 to prevent edge function error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
