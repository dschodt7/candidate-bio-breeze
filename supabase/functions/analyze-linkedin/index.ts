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
    const { candidateId, linkedinContent } = await req.json();
    console.log('Analyzing LinkedIn for candidate:', candidateId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch candidate data
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('linkedin_url')
      .eq('id', candidateId)
      .single();

    if (candidateError) throw candidateError;

    const contentToAnalyze = linkedinContent || candidate.linkedin_url;
    if (!contentToAnalyze) {
      throw new Error('No LinkedIn content available for analysis');
    }

    const systemPrompt = `You are an AI assistant that analyzes LinkedIn profiles. Return a JSON object with exactly these fields (no markdown, no additional text):
{
  "credibilityStatements": "focus on endorsements and recommendations",
  "caseStudies": "notable projects and achievements",
  "jobAssessment": "deeper insights into responsibilities and leadership",
  "motivations": "career aspirations and professional interests",
  "businessProblems": "areas of expertise based on skills and endorsements",
  "interests": "professional and personal interests",
  "activitiesAndHobbies": "volunteer work and extracurricular activities",
  "foundationalUnderstanding": "personality traits and interpersonal skills"
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
          { role: 'user', content: contentToAnalyze }
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
      const cleanContent = content.trim();
      console.log('Cleaned content:', cleanContent);
      
      analysis = JSON.parse(cleanContent);
      console.log('Parsed analysis:', analysis);

      // Store analysis results
      const { error: updateError } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          linked_in_analysis: analysis
        });

      if (updateError) throw updateError;
      console.log('Stored LinkedIn analysis results in database');

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
    console.error('Error in analyze-linkedin function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});