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

    const systemPrompt = `You are an expert executive recruiter with decades of experience analyzing resumes. Your task is to provide a detailed, insightful analysis of the resume focusing on concrete examples and specific details. For each section, you must extract and analyze actual content from the resume, not make generic statements.

Analyze the resume and return a JSON object with the following sections:

{
  "credibility_statements": "List specific achievements, metrics, and recognition that establish the candidate's credibility. Include numbers, percentages, and concrete results.",
  "case_studies": "Describe 2-3 significant projects or initiatives from the resume, including the challenge, action, and quantifiable results.",
  "job_assessment": "Analyze their career progression, including role transitions, promotions, and skill development. Note any interesting patterns or rapid advancement.",
  "motivations": "Based on their career choices and achievements, infer their key professional motivations and career drivers.",
  "business_problems": "From their experience, identify specific types of business challenges they excel at solving. Include examples from their work history.",
  "additional_observations": "Share unique insights about their career path, leadership style, or distinctive patterns in their experience."
}

Important guidelines:
1. Always reference specific details from the resume
2. Use concrete examples and metrics whenever possible
3. If certain information isn't available, explain what would make the analysis stronger rather than stating it's missing
4. Focus on insights that would be valuable for executive recruitment`;

    const userPrompt = `Analyze this executive resume and provide detailed insights based on the actual content:\n\n${resumeText}`;

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