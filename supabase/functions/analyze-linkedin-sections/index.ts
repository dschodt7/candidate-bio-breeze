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
    const { candidateId, sections } = await req.json();
    console.log('Analyzing LinkedIn sections for candidate:', candidateId);

    if (!sections || sections.length === 0) {
      throw new Error('No LinkedIn sections provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Combine all section content for analysis
    const combinedContent = sections
      .map(section => `${section.section_type.toUpperCase()}:\n${section.content || 'No content'}`)
      .join('\n\n');

    console.log('Sending request to OpenAI for LinkedIn analysis');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert AI that analyzes LinkedIn profiles to extract meaningful insights about candidates. Focus on concrete examples, specific achievements, and quantifiable metrics. Your analysis should be detailed and based on the actual content provided. Return ONLY raw JSON without any markdown formatting or additional text. The JSON must contain exactly these fields:
            {
              "credibilityStatements": "detailed endorsements and recognitions that enhance credibility, focusing on specific achievements and metrics",
              "caseStudies": "concrete examples of professional achievements with measurable outcomes",
              "jobAssessment": "comprehensive insights into responsibilities and leadership roles, including scope and impact",
              "motivations": "clear personal and professional aspirations backed by examples from their career history",
              "businessProblems": "specific areas of expertise and demonstrated excellence with examples",
              "interests": "professional interests and passions that align with their career trajectory",
              "activities": "meaningful volunteer work and personal initiatives with impact",
              "foundationalUnderstanding": "key personality traits and interpersonal skills evidenced in their profile"
            }`
          },
          {
            role: 'user',
            content: combinedContent
          }
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
      // Clean the response of any markdown formatting
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      console.log('Cleaned content:', cleanedContent);
      
      analysis = JSON.parse(cleanedContent);
      console.log('Parsed analysis:', analysis);

      // Update the analysis in the database
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('linkedin_sections')
        .update({ analysis })
        .eq('candidate_id', candidateId)
        .eq('section_type', 'about');

      if (updateError) throw updateError;
      console.log('Stored analysis results in database');

      return new Response(
        JSON.stringify({ success: true, data: analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error processing OpenAI response:', error);
      throw new Error(`Failed to process analysis results: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in analyze-linkedin-sections function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});