import mammoth from "mammoth";
import { supabase } from "@/integrations/supabase/client";
import { validateTextContent } from "@/utils/textCleaning";

interface ExtractionError extends Error {
  type: 'PDF_PARSING' | 'DOCX_PARSING' | 'VALIDATION' | 'UNKNOWN';
  details?: unknown;
}

class TextExtractionError extends Error implements ExtractionError {
  type: ExtractionError['type'];
  details?: unknown;

  constructor(message: string, type: ExtractionError['type'], details?: unknown) {
    super(message);
    this.type = type;
    this.details = details;
    this.name = 'TextExtractionError';
  }
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log("[textExtraction] Starting PDF text extraction for:", file.name);
  
  try {
    const fileName = `temp_${crypto.randomUUID()}.pdf`;
    console.log("[textExtraction] Uploading PDF for processing:", fileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (uploadError) {
      console.error("[textExtraction] Storage upload error:", uploadError);
      throw new TextExtractionError(
        `Failed to upload PDF: ${uploadError.message}`,
        'PDF_PARSING',
        uploadError
      );
    }

    console.log("[textExtraction] PDF uploaded successfully, calling process-pdf function");
    
    const { data, error } = await supabase.functions.invoke('process-pdf', {
      body: { fileName }
    });

    if (error) {
      console.error("[textExtraction] Edge function error:", error);
      throw new TextExtractionError(
        `PDF processing failed: ${error.message}`,
        'PDF_PARSING',
        error
      );
    }

    if (!data || !data.text) {
      console.error("[textExtraction] No text returned from edge function:", data);
      throw new TextExtractionError(
        'No text content returned from PDF processing',
        'PDF_PARSING',
        { data }
      );
    }

    console.log("[textExtraction] PDF text extracted successfully, length:", data.text.length);
    
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
    console.error("[textExtraction] Error in PDF text extraction:", error);
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

export const extractTextFromDOCX = async (file: File): Promise<string> => {
  console.log("[textExtraction] Starting DOCX text extraction for:", file.name);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log("[textExtraction] DOCX ArrayBuffer size:", arrayBuffer.byteLength);
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    const extractedText = result.value;
    console.log("[textExtraction] Raw DOCX text extracted, length:", extractedText.length);

    const { isValid, issues } = validateTextContent(extractedText, 'DOCX');
    
    if (!isValid) {
      throw new TextExtractionError(
        `DOCX validation failed: ${issues.join(', ')}`,
        'DOCX_PARSING',
        { issues, textLength: extractedText.length }
      );
    }
    
    return extractedText;
  } catch (error) {
    console.error("[textExtraction] Error in DOCX text extraction:", error);
    if (error instanceof TextExtractionError) {
      throw error;
    }
    throw new TextExtractionError(
      'Failed to extract text from DOCX',
      'DOCX_PARSING',
      error
    );
  }
};

export const extractText = async (file: File): Promise<string> => {
  console.log("[textExtraction] Starting text extraction from file:", {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString()
  });
  
  try {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    console.log("[textExtraction] File extension detected:", fileExtension);

    let extractedText = '';
    if (fileExtension === 'docx') {
      extractedText = await extractTextFromDOCX(file);
    } 
    else if (fileExtension === 'pdf') {
      extractedText = await extractTextFromPDF(file);
    } else {
      throw new TextExtractionError(
        `Unsupported file type: ${fileExtension}`,
        'UNKNOWN',
        { fileExtension }
      );
    }

    return extractedText;
  } catch (error) {
    console.error("[textExtraction] Error extracting text:", error);
    if (error instanceof TextExtractionError) {
      throw error;
    }
    throw new TextExtractionError(
      'Unexpected error during text extraction',
      'UNKNOWN',
      error
    );
  }
};