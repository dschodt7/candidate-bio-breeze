import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('New request received:', new Date().toISOString());

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId, screenshot } = await req.json();
    console.log('Processing request for candidate:', candidateId);

    if (!candidateId) {
      throw new Error('Missing candidateId parameter');
    }
    if (!screenshot) {
      throw new Error('Missing screenshot parameter');
    }

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
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that extracts text from LinkedIn About section screenshots. If you can't identify a LinkedIn About section in the image, respond with an error message. Otherwise, return only the extracted text."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the text from this LinkedIn About section screenshot. If you can't identify a LinkedIn About section, let me know."
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

    // Check if the response indicates an error in identifying the LinkedIn section
    if (extractedText.toLowerCase().includes("unable to extract") || 
        extractedText.toLowerCase().includes("can't identify")) {
      return new Response(
        JSON.stringify({ 
          error: "No LinkedIn About section detected in the screenshot. Please ensure you're uploading a screenshot of a LinkedIn About section."
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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