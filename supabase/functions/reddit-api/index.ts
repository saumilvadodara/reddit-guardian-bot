
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
          JSON.stringify({ error: 'Reddit authentication failed - token may be expired' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 403) {
        // For 403 errors, return a more specific message
        if (endpoint.includes('moderator')) {
          return new Response(
            JSON.stringify({ 
              error: 'No moderated communities found or insufficient permissions',
              data: { data: { children: [] } } // Return empty array structure
            }),
            { 
              status: 200, // Return 200 with empty data instead of error
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Access forbidden - insufficient permissions' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Reddit API error: ${response.status} - ${errorText}` }),
        { 
          status: response.status,
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
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
