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
    const { candidateId, format, tone, components } = await req.json();
    console.log('[generate-executive-summary] Processing request for candidate:', candidateId);
    console.log('[generate-executive-summary] Options:', { format, tone, components });

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

    const toneInstructions = {
      formal: "Create a professional and data-driven executive summary using precise language and clear hierarchical structure.",
      narrative: "Craft an engaging narrative that tells the leader's story through their achievements and impact, using storytelling techniques.",
      glorious: "Compose an inspiring and bold executive summary that emphasizes magnitude of achievements and visionary leadership."
    };

    const formatInstructions = {
      snapshot: "Create a concise 1-2 paragraph executive summary highlighting the most impactful achievements and unique value proposition.",
      detailed: "Generate a full-page executive summary with detailed sections on achievements, leadership approach, and strategic impact.",
      comprehensive: "Produce a comprehensive 2-3 page executive profile with in-depth analysis of leadership style, achievements, and strategic capabilities."
    };

    const systemPrompt = `You are an expert executive recruiter creating powerful executive summaries. Your task is to synthesize data from multiple sources into a compelling narrative that showcases distinctive leadership capability, strategic impact, and their personality/character in a matter-of-fact, concise manner.

Focus on:
1. Quantifiable achievements and business impact
- Revenue growth and P&L responsibility
- Team size and organizational scope
- Budget management and resource allocation
- Market expansion and business development
- Cost reduction and operational efficiency

2. Strategic leadership capabilities
- Vision setting and strategy execution
- Change management and transformation
- Innovation and digital initiatives
- Cross-functional leadership
- Stakeholder management

3. Unique problem-solving approaches
- Complex challenge resolution
- Crisis management
- Strategic decision-making
- Risk assessment and mitigation
- Process optimization

4. Industry expertise and thought leadership
- Sector-specific knowledge
- Market understanding
- Technical competencies
- Industry recognition
- Speaking engagements or publications

5. Career progression and growth trajectory
- Role advancement patterns
- Increasing responsibility
- Geographic exposure
- International experience
- Educational background

Output Format:
Return a JSON object with these sections:
{
  "executiveSummary": "comprehensive narrative highlighting key strengths",
  "coreProficiencies": ["list of 5-7 standout capabilities"],
  "strategicImpact": "focus on measurable business outcomes",
  "leadershipStyle": "distinctive approach and philosophy",
  "careerTrajectory": "pattern of growth and advancement",
  "marketPositioning": "unique value proposition"
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

Selected Components to Include:
${JSON.stringify(components, null, 2)}

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
