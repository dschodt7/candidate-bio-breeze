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
    console.log('Processing credibility statements for candidate:', candidateId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch resume analysis
    const { data: resumeAnalysis, error: resumeError } = await supabase
      .from('resume_analyses')
      .select('credibility_statements')
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
      .eq('section_type', 'about')
      .maybeSingle();

    if (linkedinError) {
      console.error('Error fetching LinkedIn analysis:', linkedinError);
      throw linkedinError;
    }

    const resumeCredibility = resumeAnalysis?.credibility_statements || '';
    const linkedinCredibility = linkedinAnalysis?.analysis?.credibilityStatements || '';

    console.log('Resume credibility:', resumeCredibility);
    console.log('LinkedIn credibility:', linkedinCredibility);

    // If both sources are empty, return early
    if (!resumeCredibility && !linkedinCredibility) {
      console.log('No credibility statements found from either source');
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            mergedStatements: [],
            sourceBreakdown: {
              resume: 'No credibility statements found in resume',
              linkedin: 'No credibility statements found in LinkedIn profile'
            }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert executive recruiter assistant specializing in merging and prioritizing candidate credibility statements from multiple sources. Your task is to:

1. Analyze and combine credibility statements from both resume and LinkedIn profile
2. Prioritize concrete metrics, achievements, and quantifiable results
3. Remove duplicates while preserving unique insights
4. Structure the output in a clear, impactful format
5. Focus on information that validates the candidate's expertise

For the sourceBreakdown analysis:
- Evaluate the strength and quality of credibility statements from each source
- Highlight the unique contributions from each source
- Note any patterns or complementary information between sources
- Assess the specificity and measurability of statements from each source

Return a JSON object with two properties:
- mergedStatements: An array of the final, merged credibility statements
- sourceBreakdown: An object containing detailed analysis of both sources' contributions, with 'resume' and 'linkedin' properties`;

    const userPrompt = `Please analyze and merge these credibility statements:

Resume Statements:
${resumeCredibility}

LinkedIn Statements:
${linkedinCredibility}

Provide a merged version that emphasizes concrete achievements and metrics while eliminating duplicates, and include a detailed analysis of each source's contribution.`;

    console.log('Sending request to OpenAI');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
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

      // Store the merged analysis
      const { error: updateError } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          brass_tax_criteria: {
            ...analysis,
            lastUpdated: new Date().toISOString()
          }
        }, {
          onConflict: 'candidate_id'
        });

      if (updateError) throw updateError;
      console.log('Stored merged analysis in database');

      return new Response(
        JSON.stringify({ success: true, data: analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error processing OpenAI response:', error);
      throw new Error(`Failed to process merged analysis: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in merge-credibility-statements function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});