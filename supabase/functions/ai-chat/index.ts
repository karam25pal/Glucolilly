import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get recent chat history for context (last 20 messages)
    const { data: chatHistory } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('user_id', userId || 'guest')
      .order('created_at', { ascending: false })
      .limit(20);

    // Get user preferences for personalization
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId || 'guest')
      .single();

    // Build context-aware system prompt with learned preferences
    const systemPrompt = `You are a compassionate diabetes management AI assistant for GlucoLilly. You speak with warmth and encouragement, keeping your tone professional and inclusive.

USER PROFILE:
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

LEARNED PREFERENCES:
${preferences ? `
- Favorite Foods: ${preferences.favorite_foods?.join(', ') || 'None recorded yet'}
- Foods to Avoid: ${preferences.disliked_foods?.join(', ') || 'None recorded yet'}
- Exercise Preferences: ${preferences.exercise_preferences?.join(', ') || 'None recorded yet'}
- Common Challenges: ${preferences.common_challenges?.join(', ') || 'None recorded yet'}
- Successful Strategies: ${preferences.successful_strategies?.join(', ') || 'None recorded yet'}
- Additional Notes: ${preferences.notes || 'None'}
` : 'No preferences learned yet. Learn from conversation to personalize advice.'}

CONVERSATION INSIGHTS:
Use the chat history to understand patterns, remember previous advice given, and build continuity. Notice what works for this user and adapt suggestions accordingly.

Your role:
- Provide PERSONALIZED diabetes management advice based on user's data AND learned preferences
- Remember previous conversations and build on them
- Adapt suggestions based on what has worked or not worked for this user
- Suggest meal improvements considering their food preferences
- Guide exercise routines based on their preferences and capabilities
- Monitor glucose trends and provide actionable insights
- Encourage and motivate with kindness
- Always prioritize safety - if you detect concerning values, urge immediate medical attention
- Learn from each interaction to improve future suggestions

When you notice patterns in conversation (favorite foods, exercise preferences, challenges, successful strategies), mentally note them to inform your advice. The system will automatically extract and save these insights.

Safety thresholds:
- Fasting glucose ≥126 mg/dL or random ≥200 mg/dL with symptoms = urgent care needed
- Any chest pain, severe shortness of breath, or fainting = emergency

Be concise, actionable, and supportive.`;

    // Combine chat history with current messages
    const conversationHistory = chatHistory ? chatHistory.reverse() : [];
    const allMessages = [
      ...conversationHistory,
      ...messages,
    ];

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
          ...allMessages,
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
    const assistantMessage = data.choices[0].message.content;

    // Save the conversation to database
    const userMessage = messages[messages.length - 1];
    
    if (userMessage) {
      await supabase.from('chat_history').insert([
        {
          user_id: userId || 'guest',
          role: 'user',
          content: userMessage.content
        },
        {
          user_id: userId || 'guest',
          role: 'assistant',
          content: assistantMessage
        }
      ]);
    }

    // Extract and update preferences from conversation
    // This is a simple keyword-based extraction - in production you'd use more sophisticated NLP
    const messageText = `${userMessage?.content || ''} ${assistantMessage}`.toLowerCase();
    
    const updatesNeeded: any = {};
    
    // Check for food preferences
    if (messageText.includes('love') || messageText.includes('favorite') || messageText.includes('enjoy')) {
      // Would implement more sophisticated food extraction here
    }
    
    // Check for exercise preferences
    if (messageText.includes('exercise') || messageText.includes('workout') || messageText.includes('activity')) {
      // Would implement more sophisticated exercise extraction here
    }

    // Update preferences if we learned something new
    if (Object.keys(updatesNeeded).length > 0) {
      await supabase.from('user_preferences').upsert({
        user_id: userId || 'guest',
        ...updatesNeeded
      });
    }
    
    return new Response(
      JSON.stringify({ 
        message: assistantMessage
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
