import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Enhanced logging for request tracking
  console.log('New request received:', new Date().toISOString());

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId, screenshot } = await req.json();
    console.log('Processing request for candidate:', candidateId);

    // Validate required parameters
    if (!candidateId) {
      throw new Error('Missing candidateId parameter');
    }
    if (!screenshot) {
      throw new Error('Missing screenshot parameter');
    }

    // Validate OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log('Calling OpenAI API for text extraction...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
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
      console.error('OpenAI API error details:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('Received OpenAI response successfully');

    if (!openAIData.choices || !openAIData.choices[0]?.message?.content) {
      console.error('Invalid OpenAI response format:', openAIData);
      throw new Error('Invalid response format from OpenAI');
    }

    const extractedText = openAIData.choices[0].message.content;
    console.log('Text extracted successfully, length:', extractedText.length);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Updating database with extracted text...');
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

    console.log('Database updated successfully');
    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-linkedin-about function:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Determine appropriate status code based on error type
    let statusCode = 500;
    if (error.message.includes('Missing')) {
      statusCode = 400;
    } else if (error.message.includes('not configured')) {
      statusCode = 503;
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});