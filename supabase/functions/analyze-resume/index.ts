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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId } = await req.json();
    console.log('[analyze-resume] Starting analysis for candidate:', candidateId);

    if (!candidateId) {
      console.error('[analyze-resume] Error: No candidate ID provided');
      throw new Error('No candidate ID provided');
    }

    const supabase = initializeSupabase();
    console.log('[analyze-resume] Supabase client initialized');

    // Fetch candidate data
    console.log('[analyze-resume] Fetching candidate data');
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
      
      resumeText = await extractTextFromFile(resumeFile, fileExtension);
      console.log('[analyze-resume] Text extraction completed, length:', resumeText.length);

      // Store the extracted text
      console.log('[analyze-resume] Storing extracted text...');
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ resume_text: resumeText })
        .eq('id', candidateId);

      if (updateError) {
        console.error('[analyze-resume] Error storing resume text:', updateError);
        // Continue with analysis even if storage fails
      } else {
        console.log('[analyze-resume] Resume text stored successfully');
      }
    }

    if (!resumeText || resumeText.length === 0) {
      console.error('[analyze-resume] Empty text extracted from resume');
      throw new Error('Failed to extract text from resume');
    }

    // Analyze with OpenAI
    console.log('[analyze-resume] Starting OpenAI analysis, text length:', resumeText.length);
    const content = await analyzeResumeWithAI(resumeText, Deno.env.get('OPENAI_API_KEY')!);
    console.log('[analyze-resume] OpenAI analysis completed successfully');
    
    // Process and store the analysis
    console.log('[analyze-resume] Processing analysis content');
    const sections = processAnalysisContent(content);
    console.log('[analyze-resume] Analysis processed into sections:', Object.keys(sections).length);
    
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