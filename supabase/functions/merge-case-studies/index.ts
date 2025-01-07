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
    const { candidateId } = await req.json();
    console.log('Processing case studies for candidate:', candidateId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch resume analysis
    const { data: resumeAnalysis, error: resumeError } = await supabase
      .from('resume_analyses')
      .select('case_studies')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (resumeError) {
      console.error('Error fetching resume analysis:', resumeError);
      throw resumeError;
    }

    // Fetch LinkedIn analysis
    const { data: linkedinAnalysis, error: linkedinError } = await supabase
      .from('linkedin_sections')
      .select('analysis')
      .eq('candidate_id', candidateId)
      .eq('section_type', 'experience_1')
      .maybeSingle();

    if (linkedinError) {
      console.error('Error fetching LinkedIn analysis:', linkedinError);
      throw linkedinError;
    }

    const resumeCaseStudies = resumeAnalysis?.case_studies || '';
    const linkedinCaseStudies = linkedinAnalysis?.analysis?.caseStudies || '';

    console.log('Resume case studies:', resumeCaseStudies);
    console.log('LinkedIn case studies:', linkedinCaseStudies);

    const systemPrompt = `You are an expert executive recruiter specializing in analyzing and validating leadership case studies. Your task is to:

1. Analyze case study examples from both resume and LinkedIn sources
2. Create a merged set of case studies that:
   - Focus on strategic initiatives and complex challenges
   - Highlight leadership approach and decision-making process
   - Emphasize measurable outcomes and business impact
   - Demonstrate scope and scale of projects
   - Show progression of leadership capabilities
3. Analyze the strength and quality of each source

Return a JSON object with:
{
  "mergedStatements": ["statement1", "statement2", ...],
  "sourceBreakdown": {
    "resume": {
      "relevance": "Assessment of how well the resume demonstrates strategic initiatives",
      "confidence": "Evaluation of case study detail and validation",
      "uniqueValue": "Distinct insights from resume format"
    },
    "linkedin": {
      "relevance": "Assessment of how well LinkedIn showcases leadership examples",
      "confidence": "Evaluation of case study context and validation",
      "uniqueValue": "Unique perspectives from LinkedIn format"
    }
  }
}`;

    const userPrompt = `Please analyze and merge these case studies:

Resume Case Studies:
${resumeCaseStudies}

LinkedIn Case Studies:
${linkedinCaseStudies}

Create a cohesive set of case study examples and analyze each source's contribution.`;

    console.log('Sending request to OpenAI');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('Received OpenAI response');

    const content = openAIData.choices[0].message.content;
    console.log('Raw OpenAI response:', content);

    let analysis;
    try {
      analysis = JSON.parse(content);
      console.log('Parsed analysis:', analysis);

      // Store the merged analysis in executive_summaries
      const { error: updateError } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          case_studies: analysis.mergedStatements.join('\n\n'),
          resume_case_source: analysis.sourceBreakdown.resume,
          linkedin_case_source: analysis.sourceBreakdown.linkedin
        }, {
          onConflict: 'candidate_id'
        });

      if (updateError) throw updateError;
      console.log('Stored merged analysis in database');

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            mergedStatements: analysis.mergedStatements,
            sourceBreakdown: analysis.sourceBreakdown
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error processing OpenAI response:', error);
      throw new Error(`Failed to process merged analysis: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in merge-case-studies function:', error);
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