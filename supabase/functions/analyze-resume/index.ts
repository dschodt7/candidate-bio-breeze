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

    const resumeText = await resumeFile.text();
    console.log('Resume text length:', resumeText.length);

    // Simplified system prompt with explicit JSON format requirement
    const systemPrompt = `You are an AI assistant that analyzes resumes. Return your analysis as a plain JSON object (no markdown formatting) with these exact fields:
{
  "credibilityStatements": "string with key achievements",
  "caseStudies": "string with notable projects",
  "jobAssessment": "string with career analysis",
  "motivations": "string with career insights",
  "businessProblems": "string with key challenges solved",
  "additionalObservations": "string with unique elements"
}`;

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
    console.log('Raw OpenAI response content:', content);

    let analysis;
    try {
      // More aggressive cleanup of any potential markdown or formatting
      const cleanContent = content
        .replace(/^```[\s\S]*?\n/, '') // Remove opening markdown
        .replace(/\n```$/, '')         // Remove closing markdown
        .replace(/^`{1,3}|`{1,3}$/g, '') // Remove any remaining backticks
        .trim();
      
      console.log('Cleaned content before parsing:', cleanContent);
      
      analysis = JSON.parse(cleanContent);
      console.log('Successfully parsed analysis:', analysis);

      // Validate the expected structure
      const requiredFields = [
        'credibilityStatements',
        'caseStudies',
        'jobAssessment',
        'motivations',
        'businessProblems',
        'additionalObservations'
      ];

      const missingFields = requiredFields.filter(field => !(field in analysis));
      if (missingFields.length > 0) {
        throw new Error(`Response missing required fields: ${missingFields.join(', ')}`);
      }

      // Store analysis results
      const { error: updateError } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          brass_tax_criteria: analysis
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
      console.error('Raw response content:', content);
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