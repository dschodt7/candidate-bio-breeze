import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import * as pdfParse from 'npm:pdf-parse';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId, filePath } = await req.json();
    console.log('[process-pdf] Starting PDF processing:', { candidateId, filePath });

    if (!candidateId || !filePath) {
      throw new Error('Missing required parameters: candidateId and filePath');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[process-pdf] Downloading PDF from storage');
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('resumes')
      .download(filePath);

    if (downloadError) {
      console.error('[process-pdf] Error downloading PDF:', downloadError);
      throw new Error(`Failed to download PDF: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error('No file data received from storage');
    }

    // Check file size
    const fileSizeInMB = fileData.size / (1024 * 1024);
    if (fileSizeInMB > 5) {
      throw new Error('PDF file size exceeds 5MB limit');
    }

    console.log('[process-pdf] PDF downloaded successfully, size:', fileSizeInMB.toFixed(2), 'MB');

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    
    // Process PDF with pdf-parse
    console.log('[process-pdf] Starting PDF text extraction');
    const result = await pdfParse(pdfData);
    
    console.log('[process-pdf] Text extraction completed, length:', result.text.length);

    // Update candidate record with extracted text
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ resume_text: result.text })
      .eq('id', candidateId);

    if (updateError) {
      console.error('[process-pdf] Error updating candidate:', updateError);
      throw new Error(`Failed to update candidate: ${updateError.message}`);
    }

    console.log('[process-pdf] Successfully processed PDF and updated candidate');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'PDF processed successfully',
        textLength: result.text.length,
        metadata: {
          pages: result.numpages,
          info: result.info,
          version: result.version
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[process-pdf] Processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});