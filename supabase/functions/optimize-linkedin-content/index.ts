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
    const { sections, format, tone } = await req.json();
    console.log('[optimize-linkedin-content] Processing request:', { format, tone });
    console.log('[optimize-linkedin-content] Sections to optimize:', sections);

    const systemPrompt = `You are an expert LinkedIn profile optimizer for executive leaders. Your task is to enhance their EXISTING LinkedIn content while maintaining authenticity and impact.

Format Requirements:
${format === 'strategic-narrative' ? 'Enhance their existing narrative to better showcase strategic leadership and vision.' :
  format === 'achievement-focused' ? 'Strengthen their existing achievements and quantifiable impact.' :
  'Elevate their existing content to better establish domain expertise and thought leadership.'}

Tone Requirements:
${tone === 'ceo-board' ? 'Refine for a board-level audience while maintaining their current role context.' :
  tone === 'c-level' ? 'Enhance for C-suite peers while preserving their actual position and impact.' :
  'Optimize for senior leadership while keeping their authentic experience.'}

For each section, analyze their existing content and return:
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
  "format": "Description of format applied",
  "tone": "Description of tone used"
}`;

    const userPrompt = `Please optimize these actual LinkedIn sections while maintaining the authenticity of their role and experience:

${Object.entries(sections).map(([key, content]) => `
${key.toUpperCase()}:
${content}
`).join('\n')}

Enhance their existing content using the selected format (${format}) and tone (${tone}) while preserving their actual role and experience.`;

    console.log('[optimize-linkedin-content] Sending request to OpenAI');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: format === 'strategic-narrative' ? 'gpt-4o' : 'gpt-4o',
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
      console.error('[optimize-linkedin-content] OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('[optimize-linkedin-content] Received OpenAI response');

    const content = openAIData.choices[0].message.content;
    console.log('[optimize-linkedin-content] Raw OpenAI response:', content);

    let optimization;
    try {
      optimization = JSON.parse(content);
      console.log('[optimize-linkedin-content] Parsed optimization:', optimization);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: optimization
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('[optimize-linkedin-content] Error processing OpenAI response:', error);
      throw new Error(`Failed to process optimization: ${error.message}`);
    }
  } catch (error) {
    console.error('[optimize-linkedin-content] Error:', error);
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