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
    console.log('Processing candidate:', candidateId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch candidate data
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (candidateError) throw candidateError;
    console.log('Fetched candidate data:', candidate);

    const systemPrompt = `You are an expert executive recruiter assistant tasked with analyzing candidate information and creating structured executive summaries. Focus on extracting and organizing key professional attributes, achievements, and potential into two main categories:

1. Brass Tax Criteria - covering practical aspects
2. Sensory Criteria - covering personal and cultural fit aspects

Provide detailed, well-structured responses that can be directly mapped to our executive summary format.`;

    const userPrompt = `Please analyze this candidate's information and create a structured executive summary:

LinkedIn Profile: ${candidate.linkedin_url || 'Not provided'}
Screening Notes: ${candidate.screening_notes || 'Not provided'}
Resume Path: ${candidate.resume_path || 'Not provided'}

Please provide structured responses for each category:

1. Brass Tax Criteria:
- Compensation Expectations
- Work/Travel Preferences
- Credibility Statements
- Case Studies
- Job Assessment
- Motivations
- Timeframe

2. Sensory Criteria:
- Interests
- Business Problems They Solve
- Personal Understanding
- Flow State Activities
- Activities and Hobbies

Format the response as a JSON object with these exact keys.`;

    console.log('Sending request to OpenAI with prompts');

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
        max_tokens: 4000, // Setting a reasonable token limit
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('Received OpenAI response');

    // Parse the response into structured data
    const generatedText = openAIData.choices[0].message.content;
    console.log('Generated text:', generatedText);

    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedText);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Failed to parse OpenAI response into JSON format');
    }

    // Update executive summary in database
    const { error: updateError } = await supabase
      .from('executive_summaries')
      .upsert({
        candidate_id: candidateId,
        brass_tax_criteria: parsedContent.brassTaxCriteria || {},
        sensory_criteria: parsedContent.sensoryCriteria || {}
      });

    if (updateError) throw updateError;
    console.log('Updated executive summary in database');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Executive summary generated successfully',
      data: parsedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in synthesize-candidate function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});