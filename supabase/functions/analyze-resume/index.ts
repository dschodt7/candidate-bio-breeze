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

    console.log('Found resume path:', candidate.resume_path);

    // Get resume content from storage
    const { data: resumeFile, error: storageError } = await supabase
      .storage
      .from('resumes')
      .download(candidate.resume_path);

    if (storageError) throw storageError;

    const resumeText = await resumeFile.text();
    console.log('Resume text length:', resumeText.length);

    const systemPrompt = `You are an expert resume analyzer. Analyze the provided resume and return a JSON object with detailed analysis in the following format:

{
  "credibility_statements": "Detailed list of specific achievements and metrics from the resume",
  "case_studies": "Detailed examples of significant projects and their outcomes",
  "job_assessment": "Comprehensive analysis of career progression and role transitions",
  "motivations": "Analysis of career drivers and professional aspirations",
  "business_problems": "Specific challenges and problems the candidate has demonstrated ability to solve",
  "additional_observations": "Unique patterns, skills, or noteworthy aspects from the resume"
}

Ensure each field contains detailed, specific information from the resume. Do not use placeholder text.`;

    const userPrompt = `Analyze this resume text and provide detailed insights:\n\n${resumeText}`;

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
        temperature: 0.1,
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

      // Validate all required fields are present and are strings
      const requiredFields = [
        'credibility_statements',
        'case_studies',
        'job_assessment',
        'motivations',
        'business_problems',
        'additional_observations'
      ];

      for (const field of requiredFields) {
        if (!(field in analysis)) {
          throw new Error(`Missing required field: ${field}`);
        }
        if (typeof analysis[field] !== 'string' || !analysis[field].trim()) {
          throw new Error(`Field ${field} must be a non-empty string`);
        }
      }

      // Delete any existing analysis for this candidate
      const { error: deleteError } = await supabase
        .from('resume_analyses')
        .delete()
        .eq('candidate_id', candidateId);

      if (deleteError) throw deleteError;

      // Insert new analysis
      const { error: insertError } = await supabase
        .from('resume_analyses')
        .insert({
          candidate_id: candidateId,
          ...analysis
        });

      if (insertError) throw insertError;

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
      throw new Error('OpenAI returned an invalid or incomplete response. Please try again.');
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