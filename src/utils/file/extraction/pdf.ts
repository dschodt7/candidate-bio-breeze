import { supabase } from "@/integrations/supabase/client";
import { validateTextContent } from "@/utils/file/validation";
import { TextExtractionError } from "@/utils/file/types";

export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log("[fileProcessing] Starting PDF text extraction for:", file.name);
  
  try {
    // First upload the file to storage for processing
    const fileName = `${crypto.randomUUID()}.pdf`;
    console.log("[fileProcessing] Uploading PDF for processing:", fileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (uploadError) {
      console.error("[fileProcessing] Storage upload error:", uploadError);
      throw new TextExtractionError(
        `Failed to upload PDF: ${uploadError.message}`,
        'PDF_PARSING',
        uploadError
      );
    }

    console.log("[fileProcessing] PDF uploaded successfully, calling process-pdf function");
    
    // Call the process-pdf edge function
    const { data, error } = await supabase.functions.invoke('process-pdf', {
      body: { fileName }
    });

    if (error) {
      console.error("[fileProcessing] Edge function error:", error);
      throw new TextExtractionError(
        `PDF processing failed: ${error.message}`,
        'PDF_PARSING',
        error
      );
    }

    if (!data || !data.text) {
      console.error("[fileProcessing] No text returned from edge function:", data);
      throw new TextExtractionError(
        'No text content returned from PDF processing',
        'PDF_PARSING',
        { data }
      );
    }

    console.log("[fileProcessing] PDF text extracted successfully, length:", data.text.length);
    
    // Validate with PDF-specific rules
    const { isValid, issues } = validateTextContent(data.text, 'PDF');
    
    if (!isValid) {
      throw new TextExtractionError(
        `PDF validation failed: ${issues.join(', ')}`,
        'PDF_PARSING',
        { issues, textLength: data.text.length }
      );
    }

    return data.text;
  } catch (error) {
    console.error("[fileProcessing] Error in PDF text extraction:", error);
    if (error instanceof TextExtractionError) {
      throw error;
    }
    throw new TextExtractionError(
      'Failed to extract text from PDF',
      'PDF_PARSING',
      error
    );
  }
};