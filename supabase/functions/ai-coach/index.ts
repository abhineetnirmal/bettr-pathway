
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
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, userContext } = await req.json();

    // Create system message with user context
    const systemMessage = {
      role: "system", 
      content: `You are a helpful AI coach named Bettr that helps users build and maintain good habits.
      
      Current user context:
      ${userContext || "No specific context provided."}
      
      Provide encouraging, insightful, and practical advice to help the user build consistency with their habits.
      Keep responses brief, friendly, and actionable. Focus on small wins and realistic goal-setting.
      When appropriate, reference habit-building concepts like habit stacking, environment design,
      tiny habits, and implementation intentions.
      
      Use scientific evidence and research about habit formation when relevant.
      Celebrate the user's progress and gently encourage when they struggle.
      Avoid being judgmental or critical - always focus on the positive aspects of behavior change.`
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
      throw new Error(data.error.message || "Unknown error from OpenAI");
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI coach function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
