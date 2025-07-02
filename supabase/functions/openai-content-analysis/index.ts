
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
    const { content, prompt } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!content || !prompt) {
      throw new Error('Content and prompt are required');
    }

    console.log('Analyzing content with OpenAI...');
    console.log('Prompt:', prompt);
    console.log('Content preview:', content.substring(0, 100) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a content moderation assistant. Analyze the provided content based on the given criteria and respond with a JSON object containing:
            - "flagged": boolean (true if content violates the criteria)
            - "reason": string (explanation of why it was flagged, or "No violations detected" if not flagged)
            - "confidence": number (0-1, confidence level in the assessment)`
          },
          {
            role: 'user',
            content: `Analysis criteria: ${prompt}

Content to analyze: ${content}`
          }
        ],
        temperature: 0.1, // Low temperature for consistent moderation decisions
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('OpenAI response:', aiResponse);

    // Try to parse as JSON, fallback to text analysis
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch {
      // If not valid JSON, create a structured response
      analysis = {
        flagged: aiResponse.toLowerCase().includes('flagged') || aiResponse.toLowerCase().includes('violation'),
        reason: aiResponse,
        confidence: 0.8
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Content analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        flagged: false,
        reason: 'Analysis failed',
        confidence: 0
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
