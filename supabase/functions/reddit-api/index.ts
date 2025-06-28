
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
      
      // If it's a 401, the token might be expired or invalid
      if (response.status === 401) {
        throw new Error('Reddit authentication failed - token may be expired');
      }
      
      throw new Error(`Reddit API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Reddit API response received successfully:', JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Reddit API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
