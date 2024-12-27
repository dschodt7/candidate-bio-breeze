import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId, screenshot } = await req.json();
    console.log('Processing request for candidate:', candidateId);

    if (!candidateId || !screenshot) {
      throw new Error('Missing required parameters');
    }

    // Call OpenAI API to analyze the screenshot
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that extracts text from LinkedIn About section screenshots. Return only the extracted text, without any additional commentary or formatting."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the text from this LinkedIn About section screenshot:"
              },
              {
                type: "image_url",
                image_url: {
                  url: screenshot
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('Received OpenAI response');

    if (!openAIData.choices || !openAIData.choices[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const extractedText = openAIData.choices[0].message.content;
    console.log('Extracted text:', extractedText);

    // Update the candidate's LinkedIn analysis in the database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('executive_summaries')
      .upsert({
        candidate_id: candidateId,
        linked_in_analysis: { about: extractedText }
      }, {
        onConflict: 'candidate_id'
      });

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-linkedin-about function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});