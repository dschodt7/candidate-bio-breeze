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
    const { screenshotUrls } = await req.json();
    console.log('Processing LinkedIn screenshots:', screenshotUrls);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Combine text from all screenshots
    let combinedText = '';
    for (const url of screenshotUrls) {
      try {
        const { data: fileData } = await supabase.storage
          .from('linkedin-screenshots')
          .download(url);

        if (!fileData) {
          console.error('Failed to download screenshot:', url);
          continue;
        }

        // Convert image to text using OpenAI's GPT-4 Vision
        const base64Image = await fileData.arrayBuffer().then(buffer => 
          btoa(String.fromCharCode(...new Uint8Array(buffer)))
        );

        const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Extract and summarize the text content from this LinkedIn profile screenshot. Focus on professional details, skills, experience, and achievements.'
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: `data:image/jpeg;base64,${base64Image}`
                  }
                ]
              }
            ]
          })
        });

        if (!visionResponse.ok) {
          throw new Error(`Vision API error: ${visionResponse.statusText}`);
        }

        const visionData = await visionResponse.json();
        combinedText += visionData.choices[0].message.content + '\n\n';
      } catch (error) {
        console.error('Error processing screenshot:', error);
      }
    }

    // Analyze the combined text
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze this LinkedIn profile content and return a JSON object with these fields:
              {
                "professionalSummary": "overview of career and expertise",
                "keySkills": "list of primary skills and competencies",
                "industryExperience": "relevant industry experience",
                "leadershipStyle": "leadership approach and management style",
                "achievementsAndImpact": "notable accomplishments and results",
                "culturalFit": "work style and cultural preferences",
                "careerTrajectory": "career progression and growth pattern"
              }`
          },
          {
            role: 'user',
            content: combinedText
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })
    });

    if (!analysisResponse.ok) {
      throw new Error(`Analysis API error: ${analysisResponse.statusText}`);
    }

    const analysisData = await analysisResponse.json();
    const analysis = JSON.parse(analysisData.choices[0].message.content);

    return new Response(JSON.stringify({ 
      success: true,
      data: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-linkedin-screenshots function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});