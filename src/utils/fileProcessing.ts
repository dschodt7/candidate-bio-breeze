import { toast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import { cleanText, validateTextContent } from "./textCleaning";
import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ExtractionError extends Error {
  type: 'PDF_PARSING' | 'DOCX_PARSING' | 'VALIDATION' | 'FILE_SIZE' | 'UNKNOWN';
  details?: unknown;
}

class TextExtractionError extends Error implements ExtractionError {
  type: 'PDF_PARSING' | 'DOCX_PARSING' | 'VALIDATION' | 'FILE_SIZE' | 'UNKNOWN';
  details?: unknown;

  constructor(message: string, type: ExtractionError['type'], details?: unknown) {
    super(message);
    this.type = type;
    this.details = details;
    this.name = 'TextExtractionError';
  }
}

export const validateFile = (file: File) => {
  console.log("[fileProcessing] Validating file:", {
    name: file.name,
    type: file.type,
    size: file.size
  });

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    console.error("[fileProcessing] Invalid file type:", file.type);
    toast({
      title: "Invalid file type",
      description: "Please upload a PDF or Word document",
      variant: "destructive"
    });
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    console.error("[fileProcessing] File too large:", file.size);
    toast({
      title: "File too large",
      description: "Please upload a file smaller than 10MB",
      variant: "destructive"
    });
    return false;
  }

  console.log("[fileProcessing] File validation successful");
  return true;
};

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

export const extractTextFromDOCX = async (file: File): Promise<string> => {
  console.log("[fileProcessing] Starting DOCX text extraction for:", file.name);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log("[fileProcessing] DOCX ArrayBuffer size:", arrayBuffer.byteLength);
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    const extractedText = result.value;
    console.log("[fileProcessing] Raw DOCX text extracted, length:", extractedText.length);

    // Validate with DOCX-specific rules
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
    console.error("[fileProcessing] Error in DOCX text extraction:", error);
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
  console.log("[fileProcessing] Starting text extraction from file:", {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString()
  });
  
  try {
    if (file.size > MAX_FILE_SIZE) {
      throw new TextExtractionError(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
        'FILE_SIZE',
        { fileSize: file.size, maxSize: MAX_FILE_SIZE }
      );
    }

    let extractedText = '';
    const fileExtension = file.name.toLowerCase().split('.').pop();
    console.log("[fileProcessing] File extension detected:", fileExtension);

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

    // Validate extracted text
    const { isValid, issues } = validateTextContent(extractedText, fileExtension === 'docx' ? 'DOCX' : 'PDF');
    console.log("[fileProcessing] Text validation:", { isValid, issues });

    if (!isValid) {
      throw new TextExtractionError(
        `Text validation failed: ${issues.join(', ')}`,
        'VALIDATION',
        { issues }
      );
    }

    // Clean the text
    extractedText = cleanText(extractedText);
    console.log("[fileProcessing] Final text length after cleaning:", extractedText.length);
    
    return extractedText;
  } catch (error) {
    console.error("[fileProcessing] Error extracting text:", error);
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

const getFileExtension = (filename: string): string => {
  console.log("[fileProcessing] Getting file extension for:", filename);
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  console.log("[fileProcessing] File extension detected:", extension);
  return extension;
};

export const uploadToStorage = async (file: File, candidateId: string): Promise<string> => {
  console.log("[fileProcessing] Starting file upload to storage for candidate:", candidateId);
  
  // Add upload start toast message
  toast({
    title: "Uploading Document",
    description: "Please wait while we upload your file...",
    duration: 3000
  });
  
  try {
    const fileExt = getFileExtension(file.name);
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    console.log("[fileProcessing] Uploading file:", {
      originalName: file.name,
      sanitizedName: sanitizedFileName,
      storagePath: fileName,
      size: file.size
    });

    const { data, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("[fileProcessing] Storage upload error:", uploadError);
      throw uploadError;
    }

    console.log("[fileProcessing] File uploaded successfully:", data);
    return fileName;
  } catch (error) {
    console.error("[fileProcessing] Error in storage upload:", error);
    throw error;
  }
};
