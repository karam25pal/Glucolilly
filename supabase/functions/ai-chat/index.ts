import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    const systemPrompt = `You are a compassionate diabetes management AI assistant for GlucoLilly. You speak with warmth and encouragement.

USER CONTEXT:
${userContext ? `
- Name: ${userContext.profile?.name || 'User'}
- Age: ${userContext.profile?.age || 'Unknown'}
- Diabetes Type: ${userContext.profile?.diabetesType || 'Unknown'}
- BMI: ${userContext.profile?.bmi || 'Unknown'}
- Weekly Average Glucose: ${userContext.weeklyStats?.avgGlucose || 'Unknown'} mg/dL
- Weekly Improvement: ${userContext.weeklyStats?.improvement || 0}%
- Total Weekly Steps: ${userContext.weeklyStats?.totalSteps || 0}
- Weekly Exercise Sessions: ${userContext.weeklyStats?.exerciseSessions || 0}
` : 'No user context available'}

Your role:
- Provide personalized diabetes management advice based on user's data
- Suggest meal improvements and recipe recommendations
- Guide exercise routines safely
- Monitor glucose trends and provide actionable insights
- Encourage and motivate with kindness
- Always prioritize safety - if you detect concerning values, urge immediate medical attention
- Use "ji" and "Waheguru ji" respectfully when the user does

Safety thresholds:
- Fasting glucose ≥126 mg/dL or random ≥200 mg/dL with symptoms = urgent care needed
- Any chest pain, severe shortness of breath, or fainting = emergency

Be concise, actionable, and supportive.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway request failed");
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        message: data.choices[0].message.content 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
