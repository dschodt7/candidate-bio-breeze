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

    const systemPrompt = `You are an expert executive recruiter assistant. Your task is to analyze candidate information and create a structured executive summary in JSON format. You must return ONLY a valid JSON object with exactly two properties: "brassTaxCriteria" and "sensoryCriteria".

Each property should be an object containing the respective criteria. Do not include any explanatory text or markdown formatting. The response must be parseable by JSON.parse().`;

    const userPrompt = `Analyze this candidate's information and return a JSON object with the following structure:

{
  "brassTaxCriteria": {
    "compensationExpectations": "...",
    "workPreferences": "...",
    "credibilityStatements": "...",
    "caseStudies": "...",
    "jobAssessment": "...",
    "motivations": "...",
    "timeframe": "..."
  },
  "sensoryCriteria": {
    "interests": "...",
    "businessProblems": "...",
    "personalUnderstanding": "...",
    "flowStateActivities": "...",
    "activitiesAndHobbies": "..."
  }
}

Use this candidate data to fill in the values:
LinkedIn Profile: ${candidate.linkedin_url || 'Not provided'}
Screening Notes: ${candidate.screening_notes || 'Not provided'}
Resume Path: ${candidate.resume_path || 'Not provided'}

Remember: Return ONLY the JSON object, no additional text or formatting.`;

    console.log('Sending request to OpenAI');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',  // Fixed model name
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('Received OpenAI response');

    const generatedText = openAIData.choices[0].message.content;
    console.log('Generated text:', generatedText);

    let parsedContent;
    try {
      // Remove any potential whitespace or newlines
      const cleanedText = generatedText.trim();
      console.log('Cleaned text:', cleanedText);
      parsedContent = JSON.parse(cleanedText);

      // Validate the expected structure
      if (!parsedContent.brassTaxCriteria || !parsedContent.sensoryCriteria) {
        throw new Error('Response missing required properties');
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Raw response:', generatedText);
      throw new Error('Failed to parse OpenAI response into JSON format');
    }

    // Update executive summary in database
    const { error: updateError } = await supabase
      .from('executive_summaries')
      .upsert({
        candidate_id: candidateId,
        brass_tax_criteria: parsedContent.brassTaxCriteria,
        sensory_criteria: parsedContent.sensoryCriteria
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