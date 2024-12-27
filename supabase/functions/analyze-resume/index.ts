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

    // IMPORTANT: DO NOT CHANGE THE MODEL OR SYSTEM PROMPT WITHOUT EXPLICIT PERMISSION
    // This function requires gpt-4o for accurate resume analysis due to the need
    // for a large context window and deep understanding of professional experience
    const systemPrompt = `You are an expert resume analyzer. You must ONLY return a JSON object with the exact structure shown below. Do not include any explanations, markdown, or additional text.

The response must be a valid, parseable JSON object with these exact fields:

{
  "credibility_statements": "string with specific achievements and metrics",
  "case_studies": "string with detailed project examples",
  "job_assessment": "string analyzing career progression",
  "motivations": "string identifying career drivers",
  "business_problems": "string listing specific challenges solved",
  "additional_observations": "string noting unique patterns"
}

Any deviation from this exact format will result in an error. Do not include any conversation or explanations.`;

    const userPrompt = `Analyze this resume and return ONLY a JSON object exactly as specified. No other text or explanations:\n\n${resumeText}`;

    console.log('Sending request to OpenAI');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // DO NOT CHANGE: Required for resume analysis
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Very low temperature to ensure consistent, focused responses
        response_format: { type: "json_object" } // Force JSON response
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
      // Remove any potential whitespace or newlines
      const cleanContent = content.trim();
      console.log('Cleaned content:', cleanContent);
      
      analysis = JSON.parse(cleanContent);

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
        if (typeof analysis[field] !== 'string') {
          throw new Error(`Field ${field} must be a string`);
        }
      }

      console.log('Validated analysis object:', analysis);

      // Check if a resume analysis exists
      const { data: existingAnalysis, error: fetchError } = await supabase
        .from('resume_analyses')
        .select('id')
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let result;
      if (existingAnalysis) {
        // Update existing analysis
        console.log('Updating existing resume analysis');
        result = await supabase
          .from('resume_analyses')
          .update(analysis)
          .eq('id', existingAnalysis.id)
          .select()
          .single();
      } else {
        // Insert new analysis
        console.log('Creating new resume analysis');
        result = await supabase
          .from('resume_analyses')
          .insert({
            candidate_id: candidateId,
            ...analysis
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;
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