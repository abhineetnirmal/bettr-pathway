
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          response: "I'm currently unable to provide coaching. Please try again later or contact support if this persists.",
          error: "OpenAI API key not configured" 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, userContext, userProfile } = await req.json();

    // Create system message with enhanced coaching approach
    const systemMessage = {
      role: "system", 
      content: `You are Bettr Coach, an AI-powered personal development assistant that helps users optimize multiple facets of their lives simultaneously through habit tracking, goal setting, and personalized coaching.

      Current user context:
      ${userContext || "No specific context provided."}
      
      User profile:
      ${userProfile ? JSON.stringify(userProfile) : "No profile information available yet."}
      
      Your coaching approach:
      1. Provide personalized recommendations based on the user's habits, goals, and progress
      2. Highlight cross-domain synergies (e.g., how better sleep improves productivity)
      3. Offer evidence-based habit formation techniques
      4. Be encouraging, motivational, and solution-oriented
      
      Keep responses concise (3-5 sentences), friendly, and actionable. Focus on small wins and realistic goal-setting.
      Use scientific evidence when relevant but keep it accessible.
      Celebrate the user's progress and offer specific strategies when they struggle.
      Avoid being judgmental - always focus on the positive aspects of behavior change.`
    };

    // Add system message to the beginning
    const allMessages = [systemMessage, ...messages];

    console.log("Sending to OpenAI:", JSON.stringify(allMessages));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    console.log("Response from OpenAI:", JSON.stringify(data));

    if (data.error) {
      console.error("OpenAI API error:", data.error);
      return new Response(
        JSON.stringify({ 
          response: "I'm experiencing some technical difficulties. Please try again in a moment.",
          error: data.error.message || "Unknown error from OpenAI" 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI coach function:', error);
    return new Response(JSON.stringify({ 
      response: "I'm having trouble connecting right now. Please try again later.",
      error: error.message 
    }), {
      status: 200, // Return 200 to prevent client-side errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
