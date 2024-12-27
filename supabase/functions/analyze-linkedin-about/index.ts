import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { candidateId, screenshot } = await req.json()

    if (!candidateId || !screenshot) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Call OpenAI's GPT-4 Vision API to extract text from the screenshot
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract and return only the text content from this LinkedIn About section screenshot. Return just the raw text, no additional formatting or commentary.',
              },
              {
                type: 'image_url',
                image_url: screenshot,
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    })

    const result = await response.json()
    console.log('GPT-4 Vision API response:', result)

    if (!response.ok) {
      throw new Error('Failed to process image with GPT-4 Vision')
    }

    const extractedText = result.choices[0].message.content

    // Update the candidate's LinkedIn analysis in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: existingSummary } = await supabase
      .from('executive_summaries')
      .select('linked_in_analysis')
      .eq('candidate_id', candidateId)
      .single()

    const updatedAnalysis = {
      ...(existingSummary?.linked_in_analysis || {}),
      about: extractedText,
    }

    const { error: updateError } = await supabase
      .from('executive_summaries')
      .update({ linked_in_analysis: updatedAnalysis })
      .eq('candidate_id', candidateId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})