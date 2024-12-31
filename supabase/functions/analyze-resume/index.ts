import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractTextFromFile } from "./utils/textExtraction.ts";
import { analyzeResumeWithAI } from "./utils/openai.ts";
import { initializeSupabase, processAnalysisContent, storeAnalysis } from "./utils/database.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Add request logging
  console.log('[analyze-resume] Received request:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId } = await req.json();
    console.log('[analyze-resume] Starting analysis for candidate:', candidateId);

    if (!candidateId) {
      throw new Error('No candidate ID provided');
    }

    const supabase = initializeSupabase();
    console.log('[analyze-resume] Supabase client initialized');

    // Fetch candidate data with error handling
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('resume_path, original_filename, resume_text, name')
      .eq('id', candidateId)
      .single();

    if (candidateError) {
      console.error('[analyze-resume] Error fetching candidate:', candidateError);
      throw candidateError;
    }

    if (!candidate?.resume_path) {
      console.error('[analyze-resume] No resume found for candidate:', candidateId);
      throw new Error('No resume found for this candidate');
    }

    console.log('[analyze-resume] Found resume for candidate:', {
      candidateId,
      candidateName: candidate.name,
      path: candidate.resume_path,
      filename: candidate.original_filename,
      hasStoredText: !!candidate.resume_text
    });

    let resumeText = candidate.resume_text;

    if (!resumeText) {
      console.log('[analyze-resume] No stored text found, extracting from file...');
      
      const { data: resumeFile, error: storageError } = await supabase
        .storage
        .from('resumes')
        .download(candidate.resume_path);

      if (storageError) {
        console.error('[analyze-resume] Storage error:', storageError);
        throw storageError;
      }

      console.log('[analyze-resume] Resume file retrieved successfully');
      const fileExtension = candidate.original_filename?.toLowerCase().split('.').pop();
      console.log('[analyze-resume] Extracting text from', fileExtension, 'file');
      
      try {
        resumeText = await extractTextFromFile(resumeFile, fileExtension);
        console.log('[analyze-resume] Text extraction completed, length:', resumeText.length);

        // Store the extracted text
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ resume_text: resumeText })
          .eq('id', candidateId);

        if (updateError) {
          console.error('[analyze-resume] Error storing resume text:', updateError);
        } else {
          console.log('[analyze-resume] Resume text stored successfully');
        }
      } catch (extractError) {
        console.error('[analyze-resume] Text extraction error:', extractError);
        throw new Error(`Failed to extract text: ${extractError.message}`);
      }
    }

    if (!resumeText || resumeText.length === 0) {
      throw new Error('No text content found in resume');
    }

    // Analyze with OpenAI
    console.log('[analyze-resume] Starting OpenAI analysis, text length:', resumeText.length);
    let content;
    try {
      content = await analyzeResumeWithAI(resumeText, Deno.env.get('OPENAI_API_KEY')!);
      console.log('[analyze-resume] OpenAI analysis completed, response length:', content.length);
      console.log('[analyze-resume] Analysis preview:', content.substring(0, 500));
    } catch (aiError) {
      console.error('[analyze-resume] OpenAI analysis error:', aiError);
      throw new Error(`OpenAI analysis failed: ${aiError.message}`);
    }
    
    // Process and store the analysis
    console.log('[analyze-resume] Processing analysis content');
    const sections = processAnalysisContent(content);
    console.log('[analyze-resume] Analysis processed into sections:', {
      sectionCount: Object.keys(sections).length,
      sections: Object.fromEntries(
        Object.entries(sections).map(([key, value]) => [
          key,
          value ? `${value.substring(0, 100)}... (${value.length} chars)` : 'empty'
        ])
      )
    });
    
    await storeAnalysis(supabase, candidateId, sections);
    console.log('[analyze-resume] Analysis stored successfully');

    return new Response(JSON.stringify({ 
      success: true,
      data: sections
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[analyze-resume] Fatal error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});