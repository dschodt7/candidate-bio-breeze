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
    const { candidateId, screenshots } = await req.json();
    console.log('Processing LinkedIn screenshots for candidate:', candidateId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Analyze each screenshot with GPT-4 Vision
    let combinedText = '';
    for (const base64Image of screenshots) {
      try {
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
                content: 'Extract and summarize the text content from this LinkedIn profile screenshot. Focus on professional details, endorsements, recommendations, and activities.'
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: base64Image
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

    // Analyze the combined text to generate structured insights
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
            content: `Analyze this LinkedIn profile content and return a JSON object with exactly these fields:
              {
                "credibilityStatements": "focus on endorsements and recommendations",
                "caseStudies": "notable projects and achievements",
                "jobAssessment": "deeper insights into responsibilities and leadership",
                "motivations": "career aspirations and professional interests",
                "businessProblems": "areas of expertise based on skills and endorsements",
                "interests": "professional and personal interests",
                "activitiesAndHobbies": "volunteer work and extracurricular activities",
                "foundationalUnderstanding": "personality traits and interpersonal skills"
              }
              If no information is available for a category, use "No additional insights from LinkedIn."`
          },
          {
            role: 'user',
            content: combinedText
          }
        ]
      })
    });

    if (!analysisResponse.ok) {
      throw new Error(`Analysis API error: ${analysisResponse.statusText}`);
    }

    const analysisData = await analysisResponse.json();
    const analysis = JSON.parse(analysisData.choices[0].message.content);

    // Store analysis results
    const { error: updateError } = await supabase
      .from('executive_summaries')
      .upsert({
        candidate_id: candidateId,
        linked_in_analysis: analysis
      });

    if (updateError) throw updateError;

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