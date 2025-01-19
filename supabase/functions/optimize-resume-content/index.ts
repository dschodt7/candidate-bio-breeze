import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId, analysisType, positioningLevel, industry, sections } = await req.json();
    console.log('[optimize-resume-content] Starting optimization:', { analysisType, positioningLevel, industry });
    console.log('[optimize-resume-content] Sections to optimize:', sections);

    // Fetch candidate's resume text
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('resume_text')
      .eq('id', candidateId)
      .single();

    if (candidateError) throw candidateError;
    if (!candidate?.resume_text) throw new Error('No resume text found');

    const systemPrompt = `You are an expert resume optimization agent for executive leaders. Your role is to enhance their EXISTING resume content while maintaining authenticity and professional credibility.

Analysis Approach:
${analysisType === 'quick-scan' ? 'Focus on high-impact, essential improvements that can be quickly implemented.' :
  analysisType === 'deep-dive' ? 'Provide comprehensive analysis and detailed optimization suggestions.' :
  'Deliver strategic enhancements focused on executive positioning and market differentiation.'}

Position Level Context:
${positioningLevel === 'ceo' ? 'Optimize for board and investor audiences while preserving authentic experience.' :
  positioningLevel === 'c-level' ? 'Enhance for peer executive assessment while maintaining role authenticity.' :
  'Refine for senior leadership evaluation while keeping genuine achievements.'}

Industry Context: ${industry}

For each selected section, analyze the existing content and provide:
1. An optimized version that maintains authenticity
2. Specific improvements made to enhance impact

Return a JSON object with:
{
  "sections": {
    "sectionKey": {
      "optimized": "Enhanced content",
      "improvements": ["Specific improvement 1", "Specific improvement 2"]
    }
  },
  "analysisType": "Description of analysis approach used",
  "positioning": "How the content was aligned to the position level"
}`;

    const userPrompt = `Please optimize these resume sections while maintaining authenticity:

${Object.entries(sections)
  .filter(([_, isSelected]) => isSelected)
  .map(([key]) => `
${key.toUpperCase()}:
${candidate.resume_text}
`).join('\n')}

Enhance the content using:
- Analysis Type: ${analysisType}
- Position Level: ${positioningLevel}
- Industry Context: ${industry}

Maintain authenticity and credibility while optimizing impact.`;

    console.log('[optimize-resume-content] Sending request to OpenAI');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: analysisType === 'strategic' ? 'gpt-4o' : 'gpt-4o-mini',
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
      console.error('[optimize-resume-content] OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('[optimize-resume-content] Received OpenAI response');

    const optimization = JSON.parse(openAIData.choices[0].message.content);
    console.log('[optimize-resume-content] Parsed optimization:', optimization);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: optimization 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[optimize-resume-content] Error:', error);
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