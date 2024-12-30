import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_MODELS = ['gpt-4o'];
const DEFAULT_MODEL = 'gpt-4o';

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

Analyze the resume and provide detailed insights in these categories:

1. Credibility Statements: List specific achievements, metrics, and recognition that establish credibility
2. Case Studies: Describe 2-3 significant projects or initiatives, including challenges and results
3. Job Assessment: Analyze career progression, transitions, and skill development
4. Motivations: Infer key professional motivations from career choices
5. Business Problems: Identify specific types of business challenges they excel at solving
6. Additional Observations: Share unique insights about their career path or leadership style

Important:
- Focus on extracting ACTUAL examples and metrics from the resume
- Do not make generic statements
- If certain information isn't available, note what's missing
- Maintain a professional, executive recruitment perspective`;

    const userPrompt = `Please analyze this executive resume and provide detailed insights based on the actual content:\n\n${resumeText}`;

    console.log('Sending request to OpenAI');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
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

    // Parse the response into sections
    const sections = {
      credibility_statements: '',
      case_studies: '',
      job_assessment: '',
      motivations: '',
      business_problems: '',
      additional_observations: ''
    };

    // Split the content by numbered sections and parse
    const parts = content.split(/\d\.\s+/);
    if (parts.length > 1) {
      sections.credibility_statements = parts[1]?.split('\n\n')[0]?.trim() || '';
      sections.case_studies = parts[2]?.split('\n\n')[0]?.trim() || '';
      sections.job_assessment = parts[3]?.split('\n\n')[0]?.trim() || '';
      sections.motivations = parts[4]?.split('\n\n')[0]?.trim() || '';
      sections.business_problems = parts[5]?.split('\n\n')[0]?.trim() || '';
      sections.additional_observations = parts[6]?.split('\n\n')[0]?.trim() || '';
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
        ...sections
      });

    if (insertError) throw insertError;

    console.log('Stored analysis results in database');

    return new Response(JSON.stringify({ 
      success: true,
      data: sections
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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