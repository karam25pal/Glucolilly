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
    const { imageBase64, diabetesType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("Image data is required");
    }

    const systemPrompt = `You are a nutrition analysis AI for diabetes management. Analyze food images and provide:
1. Meal name/description
2. Estimated carbohydrates (grams)
3. Estimated calories
4. Estimated protein (grams)
5. Glycemic load estimate (low/medium/high)
6. Compatibility score for ${diabetesType || 'diabetes'} (0-1)
7. Portion recommendations
8. Healthier alternatives if needed

Be practical, encouraging, and specific. Format your response as JSON:
{
  "mealName": "string",
  "carbs": number,
  "calories": number,
  "protein": number,
  "glycemicLoad": "low|medium|high",
  "compatibilityScore": number,
  "portions": "string advice",
  "alternatives": ["string", "string"],
  "notes": "string"
}`;

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
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this meal image for diabetes management"
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
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
    let analysis;
    
    try {
      const content = data.choices[0].message.content;
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if not JSON
        analysis = {
          mealName: "Meal Analysis",
          carbs: 0,
          calories: 0,
          protein: 0,
          glycemicLoad: "medium",
          compatibilityScore: 0.5,
          portions: content,
          alternatives: [],
          notes: content
        };
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      analysis = {
        mealName: "Analysis Result",
        notes: data.choices[0].message.content
      };
    }
    
    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-meal-image error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
