import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId, format } = await req.json();
    console.log('[generate-executive-summary] Processing request for candidate:', candidateId, 'format:', format);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all relevant data
    const [
      execSummary,
      linkedInAnalysis,
      screeningAnalysis,
      resumeAnalysis
    ] = await Promise.all([
      supabase
        .from('executive_summaries')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle(),
      supabase
        .from('linkedin_sections')
        .select('analysis')
        .eq('candidate_id', candidateId)
        .eq('section_type', 'about')
        .maybeSingle(),
      supabase
        .from('screening_analyses')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle(),
      supabase
        .from('resume_analyses')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle()
    ]);

    console.log('[generate-executive-summary] Data gathered:', {
      hasExecSummary: !!execSummary.data,
      hasLinkedIn: !!linkedInAnalysis.data,
      hasScreening: !!screeningAnalysis.data,
      hasResume: !!resumeAnalysis.data
    });

    const formatInstructions = {
      snapshot: "Create a concise 1-2 paragraph executive summary highlighting the most impactful achievements and unique value proposition.",
      detailed: "Generate a full-page executive summary with detailed sections on achievements, leadership approach, and strategic impact.",
      comprehensive: "Produce a comprehensive 2-3 page executive profile with in-depth analysis of leadership style, achievements, and strategic capabilities."
    };

    const systemPrompt = `You are an expert executive recruiter creating powerful executive summaries. Your task is to synthesize data from multiple sources into a compelling narrative that showcases leadership capability and strategic impact.

Format Requirements: ${formatInstructions[format]}

Focus on:
1. Quantifiable achievements and business impact
2. Strategic leadership capabilities
3. Unique problem-solving approaches
4. Industry expertise and thought leadership
5. Career progression and growth trajectory

Return a JSON object with:
{
  "summary": "The formatted executive summary text",
  "highlights": ["Key highlight 1", "Key highlight 2", ...],
  "focusAreas": {
    "strategicLeadership": "Assessment of strategic leadership capabilities",
    "executionExcellence": "Assessment of execution and delivery capabilities",
    "innovationMindset": "Assessment of innovative thinking and problem-solving",
    "industryExpertise": "Assessment of industry knowledge and expertise"
  }
}`;

    const userPrompt = `Please analyze and synthesize this candidate data:

Executive Summary Components:
${JSON.stringify(execSummary.data, null, 2)}

LinkedIn Analysis:
${JSON.stringify(linkedInAnalysis.data?.analysis, null, 2)}

Screening Analysis:
${JSON.stringify(screeningAnalysis.data, null, 2)}

Resume Analysis:
${JSON.stringify(resumeAnalysis.data, null, 2)}

Create a compelling executive summary that showcases this leader's capabilities and impact.`;

    console.log('[generate-executive-summary] Sending request to OpenAI');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: format === 'snapshot' ? 'gpt-4o-mini' : 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('[generate-executive-summary] OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('[generate-executive-summary] Received OpenAI response');

    const content = openAIData.choices[0].message.content;
    console.log('[generate-executive-summary] Raw OpenAI response:', content);

    let analysis;
    try {
      analysis = JSON.parse(content);
      console.log('[generate-executive-summary] Parsed analysis:', analysis);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: analysis
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('[generate-executive-summary] Error processing OpenAI response:', error);
      throw new Error(`Failed to process summary: ${error.message}`);
    }
  } catch (error) {
    console.error('[generate-executive-summary] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});