import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId, notes } = await req.json();
    console.log('Analyzing screening notes for candidate:', candidateId);

    if (!notes || !notes.trim()) {
      throw new Error('No screening notes provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Sending request to OpenAI for screening analysis');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert executive recruiter analyzing candidate screening notes on behalf of the candidate. Extract meaningful insights while maintaining a consultative tone. Focus on nuanced details and strategic implications of the information provided. Return ONLY raw JSON without any markdown formatting or additional text. The JSON must contain exactly these fields:
            {
              "compensation_expectations": "analyze both stated compensation requirements and underlying motivations, including current package structure and desired changes",
              "work_arrangements": "evaluate preferred working model, including rationale for remote/hybrid preferences, geographic considerations, and travel flexibility. Consider cultural fit implications",
              "availability_timeline": "assess start date flexibility, notice period constraints, and any transitional considerations or commitating factors",
              "current_challenges": "analyze both immediate pain points and deeper underlying factors driving change. Consider career trajectory implications and growth objectives",
              "executive_summary_notes": "synthesize key strategic insights, notable discussion points, and subtle observations that could impact fit and success"
            }`
          },
          {
            role: 'user',
            content: notes
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
        .from('screening_analyses')
        .upsert({
          candidate_id: candidateId,
          raw_notes: notes,
          compensation_expectations: analysis.compensation_expectations,
          work_arrangements: analysis.work_arrangements,
          availability_timeline: analysis.availability_timeline,
          current_challenges: analysis.current_challenges,
          executive_summary_notes: analysis.executive_summary_notes
        })
        .eq('candidate_id', candidateId);

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
    console.error('Error in analyze-screening-notes function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});