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
    const { candidateId, format, tone, components } = await req.json();
    console.log('[generate-company-profile] Processing request for candidate:', candidateId);
    console.log('[generate-company-profile] Options:', { format, tone, components });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all relevant data
    const [
      companyProfile,
      linkedInAnalysis,
      screeningAnalysis,
      resumeAnalysis
    ] = await Promise.all([
      supabase
        .from('ideal_company_profiles')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle(),
      supabase
        .from('linkedin_sections')
        .select('analysis')
        .eq('candidate_id', candidateId)
        .eq('section_type', 'about')
        .maybeSingle(),
      supabase
        .from('screening_analyses')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle(),
      supabase
        .from('resume_analyses')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle()
    ]);

    console.log('[generate-company-profile] Data gathered:', {
      hasCompanyProfile: !!companyProfile.data,
      hasLinkedIn: !!linkedInAnalysis.data,
      hasScreening: !!screeningAnalysis.data,
      hasResume: !!resumeAnalysis.data
    });

    const toneInstructions = {
      strategic: "Create a market-focused analysis that emphasizes strategic fit and organizational alignment.",
      visionary: "Paint a picture of future possibilities and growth potential, highlighting innovative aspects.",
      pragmatic: "Provide practical insights focused on operational fit and immediate value alignment."
    };

    const formatInstructions = {
      snapshot: "Create a concise overview highlighting key organizational fit factors and potential synergies.",
      detailed: "Generate a comprehensive analysis of organizational alignment across all key dimensions.",
      strategic: "Produce an in-depth strategic analysis of fit, potential, and long-term value alignment."
    };

    const systemPrompt = `You are an expert executive recruiter creating ideal company profile matches. Your task is to analyze candidate data and create a compelling profile of their ideal company environment that aligns perfectly with their interests, motivations and subject expertise.

Focus on:
1. Cultural alignment and values fit
- Leadership philosophy alignment
- Decision-making style
- Communication preferences
- Innovation mindset
- Work-life balance approach

2. Leadership style compatibility
- Management structure preferences
- Reporting relationships
- Team dynamics
- Authority levels
- Mentorship opportunities

3. Growth stage preferences
- Company maturity level
- Scale-up vs. established
- Risk tolerance
- Change management needs
- Resource availability

4. Market positioning preferences
- Industry sector focus
- Competitive landscape
- Market leadership position
- Geographic presence
- Customer segment

5. Innovation and technology orientation
- Digital transformation stage
- Tech stack sophistication
- R&D investment level
- Innovation culture
- Adoption of new technologies

6. Team dynamics and organizational structure
- Team size and composition
- Matrix vs. hierarchical
- Cross-functional collaboration
- Global vs. local teams
- Decision-making processes`;

    console.log('[generate-company-profile] Sending request to OpenAI');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: format === 'snapshot' ? 'gpt-4o-mini' : 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('[generate-company-profile] OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('[generate-company-profile] Received OpenAI response');

    const content = openAIData.choices[0].message.content;
    console.log('[generate-company-profile] Raw OpenAI response:', content);

    let analysis;
    try {
      analysis = JSON.parse(content);
      console.log('[generate-company-profile] Parsed analysis:', analysis);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: analysis
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('[generate-company-profile] Error processing OpenAI response:', error);
      throw new Error(`Failed to process profile: ${error.message}`);
    }
  } catch (error) {
    console.error('[generate-company-profile] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
