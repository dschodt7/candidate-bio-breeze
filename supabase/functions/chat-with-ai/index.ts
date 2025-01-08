import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are an expert executive recruiter AI assistant. Your role is to help users evaluate executive candidates and provide insights about executive recruiting, leadership assessment, and career development.

Focus areas:
- Leadership capability assessment
- Executive career transitions
- Industry expertise evaluation
- Cultural fit analysis
- Executive compensation
- Board placement
- Succession planning

Important formatting instructions:
1. Do not use Markdown syntax like ** for emphasis
2. When using numbered lists:
   - Start each item on a new line
   - Add a space after the number and period
   - Add a blank line between items
3. Use clear paragraph breaks for readability
4. Keep responses concise and well-structured

Provide clear, actionable insights while maintaining confidentiality and professional standards.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    let reply = data.choices[0].message.content

    // Format the response
    reply = reply
      // Remove Markdown emphasis
      .replace(/\*\*/g, '')
      // Ensure proper spacing for numbered lists
      .replace(/(\d+\.)\s*/g, '\n$1 ')
      // Add extra line break between list items
      .replace(/\n(\d+\.)/g, '\n\n$1')
      // Normalize paragraph spacing
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    return new Response(
      JSON.stringify({ reply }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})