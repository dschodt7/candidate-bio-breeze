import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { default as pdfParse } from 'npm:pdf-parse@1.1.1';

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
    console.log("[process-pdf] Starting PDF processing");
    const { fileName } = await req.json();
    
    if (!fileName) {
      console.error("[process-pdf] No file name provided");
      throw new Error('No file name provided');
    }

    console.log("[process-pdf] Processing file:", fileName);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("[process-pdf] Downloading file from storage");
    
    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('resumes')
      .download(fileName);

    if (downloadError) {
      console.error("[process-pdf] Error downloading file:", downloadError);
      throw downloadError;
    }

    if (!fileData) {
      console.error("[process-pdf] No file data received from storage");
      throw new Error('No file data received from storage');
    }

    console.log("[process-pdf] File downloaded, size:", fileData.size);

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log("[process-pdf] Starting PDF parsing");

    // Parse PDF
    const result = await pdfParse(uint8Array);

    console.log("[process-pdf] PDF parsed successfully:", {
      pages: result.numpages,
      info: result.info,
      version: result.version,
      textLength: result.text.length
    });

    // Basic validation
    if (!result.text || result.text.trim().length === 0) {
      throw new Error('No text content extracted from PDF');
    }

    return new Response(
      JSON.stringify({
        success: true,
        text: result.text,
        metadata: {
          pages: result.numpages,
          info: result.info,
          version: result.version
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("[process-pdf] Error processing PDF:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});