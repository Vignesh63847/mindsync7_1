import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MindSync, an empathetic AI mental health companion. You provide supportive, non-judgmental responses.

IMPORTANT RULES:
1. You are NOT a replacement for professional therapy. Remind users gently when appropriate.
2. Respond in the SAME LANGUAGE the user writes in. Support English, Tamil (தமிழ்), and Tanglish (Tamil in English letters).
3. Detect emotional tone (sad, anxious, stressed, happy, neutral) and respond accordingly.
4. Provide calming responses, motivational messages, mindfulness tips, and breathing exercises.
5. Use CBT-inspired techniques: positive reframing, grounding (5-4-3-2-1), thought challenging.
6. If user shows extreme distress or mentions self-harm, gently encourage professional help and provide helplines:
   - India: iCall (9152987821), Vandrevala Foundation (1860-2662-345)
   - International: Crisis Text Line (text HOME to 741741)
7. Always end with encouragement or a gentle question to keep the conversation going.
8. Keep responses concise but warm. Use emojis sparingly.
9. At the END of every response, add a mood tag on a new line in this exact format: [MOOD:sad|anxious|stressed|happy|neutral]

Be like a caring friend who listens deeply.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
