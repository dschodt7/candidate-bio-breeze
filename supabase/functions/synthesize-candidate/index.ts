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
    const { candidateId } = await req.json();
    console.log('Processing candidate:', candidateId);

    // Initialize Supabase client
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

    // Prepare the prompt for OpenAI
    const systemPrompt = `You are an expert executive recruiter assistant. Your task is to analyze candidate information and create structured executive summaries. Focus on key professional attributes, achievements, and potential.`;

    const userPrompt = `Please analyze the following candidate information and create a structured executive summary:

LinkedIn Profile: ${candidate.linkedin_url || 'Not provided'}
Screening Notes: ${candidate.screening_notes || 'Not provided'}
Resume Path: ${candidate.resume_path || 'Not provided'}

Please provide structured responses for:

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
- Activities and Hobbies`;

    // Call OpenAI API
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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('Received OpenAI response');

    // Process and structure the response
    const generatedText = openAIData.choices[0].message.content;
    
    // Parse the response into structured data
    const sections = {
      brassTax: {},
      sensory: {}
    };

    // Update executive summary in database
    const { error: updateError } = await supabase
      .from('executive_summaries')
      .upsert({
        candidate_id: candidateId,
        brass_tax_criteria: sections.brassTax,
        sensory_criteria: sections.sensory
      });

    if (updateError) throw updateError;
    console.log('Updated executive summary in database');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Executive summary generated successfully',
      data: sections
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