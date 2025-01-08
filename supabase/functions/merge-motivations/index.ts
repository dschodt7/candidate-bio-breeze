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

    // Fetch LinkedIn analysis
    const { data: linkedinSection, error: linkedinError } = await supabaseClient
      .from('linkedin_sections')
      .select('analysis')
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
            content: `Please analyze and merge the following analyzed motivations to create a comprehensive motivations summary:

            Resume Analysis:
            ${resumeAnalysis?.motivations || "No resume data available"}

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

    // Updated source analysis - always return objects with the three required fields
    const sourceBreakdown = {
      resume: {
        relevance: resumeAnalysis?.motivations ? "high" : "low",
        confidence: resumeAnalysis?.motivations ? "medium" : "low",
        uniqueValue: resumeAnalysis?.motivations 
          ? "Provides structured career progression insights"
          : "No resume data available"
      },
      linkedin: {
        relevance: linkedinSection?.analysis?.motivations ? "high" : "low",
        confidence: linkedinSection?.analysis?.motivations ? "high" : "low",
        uniqueValue: linkedinSection?.analysis?.motivations
          ? "Offers analyzed motivational insights"
          : "No LinkedIn data available"
      }
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