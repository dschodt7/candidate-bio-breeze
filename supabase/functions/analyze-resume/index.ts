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

    // Convert resume file to text
    const resumeText = await resumeFile.text();
    console.log('Successfully extracted resume text:', resumeText.substring(0, 200) + '...');

    const systemPrompt = `You are an expert resume analyzer. Analyze the provided resume and extract specific insights for each category. Be thorough and specific in your analysis. For each category, provide detailed, resume-specific information. Never return "No data found" unless the category is truly empty. Format your response as a JSON object with the following structure:

{
  "credibilityStatements": string[],
  "caseStudies": string[],
  "jobAssessment": string,
  "motivations": string,
  "businessProblems": string[],
  "additionalObservations": string
}

Guidelines for each category:
- credibilityStatements: List specific achievements, certifications, and notable positions
- caseStudies: Extract specific projects or initiatives with measurable outcomes
- jobAssessment: Evaluate their career progression and key responsibilities
- motivations: Analyze career choices and patterns to identify driving factors
- businessProblems: List specific challenges they've solved or expertise areas
- additionalObservations: Note any unique patterns or standout elements

If you can't find information for a category, explain what's missing rather than just saying "No data found".`;

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
          { role: 'user', content: resumeText }
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
    console.log('Received OpenAI response:', openAIData.choices[0].message.content);

    let analysis;
    try {
      const content = openAIData.choices[0].message.content;
      const cleanedContent = content.replace(/```json\n|\n```/g, '').trim();
      analysis = JSON.parse(cleanedContent);

      // Convert arrays to strings for storage
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
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Failed to parse analysis results');
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