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
    const { candidateId, analysisType, positioningLevel, industry, sections } = await req.json();
    console.log('[optimize-resume-content] Processing request:', { analysisType, positioningLevel, industry });
    console.log('[optimize-resume-content] Sections to optimize:', sections);

    const systemPrompt = `You are an expert resume optimizer for executive leaders. Your task is to enhance their EXISTING resume content while maintaining authenticity and impact.

Analysis Type Requirements:
${analysisType === 'quick-scan' ? 'Provide a rapid assessment and essential improvements.' :
  analysisType === 'deep-dive' ? 'Deliver comprehensive analysis and detailed optimization suggestions.' :
  'Focus on strategic positioning and executive-level enhancements.'}

Positioning Level Requirements:
${positioningLevel === 'ceo' ? 'Optimize for board-level audience while maintaining their current role context.' :
  positioningLevel === 'c-level' ? 'Enhance for C-suite peers while preserving their actual position and impact.' :
  'Refine for senior leadership while keeping their authentic experience.'}

Industry Context: ${industry}

For each selected section, analyze their existing content and return:
1. Optimized version that maintains their actual role and experience
2. List of specific improvements made to their original content

Return a JSON object with:
{
  "sections": {
    "sectionKey": {
      "optimized": "Enhanced content",
      "improvements": ["Specific improvement 1", "Specific improvement 2"]
    }
  },
  "analysisType": "Description of analysis approach",
  "positioning": "Description of positioning strategy"
}`;

    const { data: resumeData, error: resumeError } = await supabase
      .from('resume_analyses')
      .select('*')
      .eq('candidate_id', candidateId)
      .single();

    if (resumeError) throw resumeError;

    const userPrompt = `Please optimize these actual resume sections while maintaining the authenticity of their role and experience:

${Object.entries(sections)
  .filter(([key, isSelected]) => isSelected)
  .map(([key]) => `
${key.toUpperCase()}:
${resumeData[key] || 'No content available'}
`).join('\n')}

Enhance their existing content using the selected analysis type (${analysisType}), positioning level (${positioningLevel}), and industry context (${industry}) while preserving their actual role and experience.`;

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

    const content = openAIData.choices[0].message.content;
    console.log('[optimize-resume-content] Raw OpenAI response:', content);

    let optimization;
    try {
      optimization = JSON.parse(content);
      console.log('[optimize-resume-content] Parsed optimization:', optimization);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: optimization
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('[optimize-resume-content] Error processing OpenAI response:', error);
      throw new Error(`Failed to process optimization: ${error.message}`);
    }
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