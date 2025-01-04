import { extractTextFromPDF } from "./file/extraction/pdf";
import { extractTextFromDOCX } from "./file/extraction/docx";
import { TextExtractionError } from "./file/types";
import { validateFile } from "./fileValidation";
import { supabase } from "@/integrations/supabase/client";

export { extractTextFromPDF, extractTextFromDOCX, TextExtractionError };

export const extractText = async (file: File): Promise<string> => {
  console.log("[fileProcessing] Starting text extraction from file:", {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString()
  });
  
  try {
    if (!validateFile(file)) {
      throw new TextExtractionError(
        'File validation failed',
        'VALIDATION',
        { fileSize: file.size }
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

export const uploadToStorage = async (file: File, candidateId: string): Promise<string> => {
  console.log("[fileProcessing] Starting file upload to storage for candidate:", candidateId);
  
  try {
    if (!validateFile(file)) {
      throw new Error('File validation failed');
    }

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
