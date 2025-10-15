import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing image for traffic violations...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert traffic violation detection system. Analyze images for these violations:
1. HELMET_VIOLATION: Motorcyclists not wearing helmets
2. RED_LIGHT_VIOLATION: Vehicles crossing red lights
3. SPEED_VIOLATION: Visual indicators of excessive speed (motion blur, aggressive driving)
4. LANE_VIOLATION: Vehicles crossing lane markings inappropriately
5. WRONG_WAY: Vehicles driving in the wrong direction

Return ONLY a valid JSON array with this exact structure:
[
  {
    "type": "HELMET_VIOLATION" | "RED_LIGHT_VIOLATION" | "SPEED_VIOLATION" | "LANE_VIOLATION" | "WRONG_WAY",
    "confidence": 0.0-1.0,
    "description": "Brief description of the violation",
    "location": "Area in the image where violation occurs",
    "severity": "low" | "medium" | "high"
  }
]

If no violations are detected, return an empty array: []

Be precise and only report violations you can clearly identify. Do not include explanations outside the JSON.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this traffic image for violations.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI response:', content);

    // Parse the JSON response
    let violations = [];
    try {
      // Extract JSON from the response (handle cases where AI adds text around JSON)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        violations = JSON.parse(jsonMatch[0]);
      } else {
        violations = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse violation detection results');
    }

    console.log('Detected violations:', violations);

    return new Response(
      JSON.stringify({ violations }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in detect-violations:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        violations: [] 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
