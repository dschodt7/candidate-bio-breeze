import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId } = await req.json();
    console.log("[merge-motivations] Processing request for candidate:", candidateId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch resume analysis
    const { data: resumeAnalysis, error: resumeError } = await supabaseClient
      .from('resume_analyses')
      .select('motivations')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (resumeError) throw resumeError;

    // Fetch LinkedIn about section
    const { data: linkedinSection, error: linkedinError } = await supabaseClient
      .from('linkedin_sections')
      .select('content, analysis')
      .eq('candidate_id', candidateId)
      .eq('section_type', 'about')
      .maybeSingle();

    if (linkedinError) throw linkedinError;

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert at analyzing executive career motivations and synthesizing insights from multiple sources. 
            Focus on key career drivers, professional aspirations, and leadership philosophy.
            Highlight values, growth goals, and change management approach.`
          },
          {
            role: "user",
            content: `Please analyze and merge the following sources to create a comprehensive motivations summary:

            Resume Analysis:
            ${resumeAnalysis?.motivations || "No resume data available"}

            LinkedIn Content:
            ${linkedinSection?.content || "No LinkedIn data available"}

            LinkedIn Analysis:
            ${linkedinSection?.analysis?.motivations || "No LinkedIn analysis available"}

            Provide a concise, well-structured summary that captures the candidate's core motivations and aspirations.`
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    const openAIData = await openAIResponse.json();
    const mergedContent = openAIData.choices[0].message.content;

    // Prepare source analysis
    const sourceBreakdown = {
      resume: resumeAnalysis?.motivations ? {
        relevance: "high",
        confidence: "medium",
        uniqueValue: "Provides structured career progression insights"
      } : null,
      linkedin: linkedinSection?.content ? {
        relevance: "medium",
        confidence: "medium",
        uniqueValue: "Offers personal narrative and aspirational context"
      } : null
    };

    console.log("[merge-motivations] Successfully merged content for candidate:", candidateId);

    return new Response(
      JSON.stringify({
        mergedContent,
        sourceBreakdown
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[merge-motivations] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});