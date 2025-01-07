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
    console.log('Processing business problems for candidate:', candidateId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch resume analysis
    const { data: resumeAnalysis, error: resumeError } = await supabase
      .from('resume_analyses')
      .select('business_problems')
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

    const resumeBusinessProblems = resumeAnalysis?.business_problems || '';
    const linkedinBusinessProblems = linkedinAnalysis?.analysis?.businessProblems || '';

    console.log('Resume business problems:', resumeBusinessProblems);
    console.log('LinkedIn business problems:', linkedinBusinessProblems);

    const systemPrompt = `You are an expert executive recruiter specializing in identifying unique business problem-solving capabilities. Your task is to:

1. Analyze business problem-solving examples from both resume and LinkedIn sources
2. Create a merged set of business problem statements that:
   - Identify distinctive approaches to complex organizational challenges
   - Highlight unique perspectives and innovative solutions
   - Focus on strategic-level business problems (e.g., market expansion, digital transformation, organizational change)
   - Demonstrate thought leadership and industry expertise
   - Show patterns in how the leader approaches different types of challenges
3. Analyze the strength and quality of each source

Return a JSON object with:
{
  "mergedStatements": ["statement1", "statement2", ...],
  "sourceBreakdown": {
    "resume": {
      "relevance": "Assessment of how well the resume demonstrates problem-solving capabilities",
      "confidence": "Evaluation of problem complexity and solution sophistication",
      "uniqueValue": "Distinct problem-solving insights from resume format"
    },
    "linkedin": {
      "relevance": "Assessment of how well LinkedIn content shows problem-solving approach",
      "confidence": "Evaluation of problem-solving context and validation",
      "uniqueValue": "Unique problem-solving perspectives from LinkedIn format"
    }
  }
}`;

    const userPrompt = `Please analyze and merge these business problem examples:

Resume Business Problems:
${resumeBusinessProblems}

LinkedIn Business Problems:
${linkedinBusinessProblems}

Create a cohesive set of business problem statements and analyze each source's contribution.`;

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
          business_problems: analysis.mergedStatements.join('\n\n'),
          resume_business_problems_source: analysis.sourceBreakdown.resume,
          linkedin_business_problems_source: analysis.sourceBreakdown.linkedin
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
    console.error('Error in merge-business-problems function:', error);
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