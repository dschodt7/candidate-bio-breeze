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
    console.log('Analyzing resume for candidate:', candidateId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch candidate data
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('resume_path')
      .eq('id', candidateId)
      .single();

    if (candidateError) throw candidateError;
    if (!candidate?.resume_path) {
      throw new Error('No resume found for this candidate');
    }

    // Get resume content from storage
    const { data: resumeFile, error: storageError } = await supabase
      .storage
      .from('resumes')
      .download(candidate.resume_path);

    if (storageError) throw storageError;

    // Convert resume file to text
    const resumeText = await resumeFile.text();
    console.log('Resume text length:', resumeText.length);

    const systemPrompt = `Analyze this resume and extract key insights. Be specific and detailed. Return a JSON object with these fields:
- credibilityStatements: Key achievements and qualifications
- caseStudies: Notable projects with measurable outcomes
- jobAssessment: Career progression analysis
- motivations: Career trajectory insights
- businessProblems: Key challenges solved
- additionalObservations: Unique elements`;

    console.log('Sending request to OpenAI');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: resumeText }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const content = openAIData.choices[0].message.content;
    console.log('Raw OpenAI response:', content);

    let analysis;
    try {
      // Clean up the response by removing markdown code blocks if present
      const cleanContent = content.replace(/```json\n|\n```|```/g, '');
      console.log('Cleaned content:', cleanContent);
      
      analysis = JSON.parse(cleanContent);
      console.log('Successfully parsed analysis:', analysis);

      // Validate the expected structure
      if (!analysis.credibilityStatements || !analysis.caseStudies || 
          !analysis.jobAssessment || !analysis.motivations || 
          !analysis.businessProblems || !analysis.additionalObservations) {
        throw new Error('Response missing required properties');
      }

      // Format the analysis for storage
      const formattedAnalysis = {
        credibilityStatements: Array.isArray(analysis.credibilityStatements) 
          ? analysis.credibilityStatements.join('\n') 
          : analysis.credibilityStatements,
        caseStudies: Array.isArray(analysis.caseStudies) 
          ? analysis.caseStudies.join('\n') 
          : analysis.caseStudies,
        jobAssessment: analysis.jobAssessment,
        motivations: analysis.motivations,
        businessProblems: Array.isArray(analysis.businessProblems) 
          ? analysis.businessProblems.join('\n') 
          : analysis.businessProblems,
        additionalObservations: analysis.additionalObservations
      };

      // Store analysis results
      const { error: updateError } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          brass_tax_criteria: formattedAnalysis
        });

      if (updateError) throw updateError;
      console.log('Stored analysis results in database');

      return new Response(JSON.stringify({ 
        success: true,
        data: analysis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error processing OpenAI response:', error);
      console.error('Raw response:', content);
      throw new Error(`Failed to process analysis results: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});