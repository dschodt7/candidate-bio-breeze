import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import { cleanText, validateTextContent } from "./textCleaning";
import { supabase } from "@/integrations/supabase/client";
import * as pdfParse from 'pdf-parse';

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export const getFileExtension = (filename: string): string => {
  const parts = filename.toLowerCase().split('.');
  return parts[parts.length - 1];
};

export const validateFile = (file: File, toast: ReturnType<typeof useToast>['toast']) => {
  console.log("[fileProcessing] Validating file:", {
    name: file.name,
    type: file.type,
    size: file.size,
    extension: getFileExtension(file.name)
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

  if (file.size > MAX_PDF_SIZE) {
    console.error("[fileProcessing] File too large:", file.size);
    toast({
      title: "File too large",
      description: "Please upload a file smaller than 10MB",
      variant: "destructive"
    });
    return false;
  }

  return true;
};

export const extractText = async (file: File): Promise<string> => {
  console.log("[fileProcessing] Starting text extraction from file:", {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString()
  });
  
  try {
    const extension = getFileExtension(file.name);
    console.log("[fileProcessing] File extension detected:", extension);

    let extractedText = '';
    
    if (extension === 'docx') {
      console.log("[fileProcessing] Processing DOCX file");
      const arrayBuffer = await file.arrayBuffer();
      console.log("[fileProcessing] DOCX ArrayBuffer size:", arrayBuffer.byteLength);
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value;
      console.log("[fileProcessing] Raw DOCX text extracted, length:", extractedText.length);
    } 
    else if (extension === 'pdf') {
      console.log("[fileProcessing] Processing PDF file");
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      
      console.log("[fileProcessing] PDF data size:", pdfData.length);
      
      try {
        const result = await pdfParse(pdfData);
        console.log("[fileProcessing] PDF parse result:", {
          pages: result.numpages,
          info: result.info,
          version: result.version,
          metadata: result.metadata,
          textLength: result.text.length
        });
        
        if (!result.text || result.text.trim().length === 0) {
          console.error("[fileProcessing] PDF contains no extractable text");
          throw new Error("No text could be extracted from this PDF. It may be image-based or corrupted.");
        }
        
        extractedText = result.text;
      } catch (pdfError) {
        console.error("[fileProcessing] PDF parsing error:", pdfError);
        throw new Error(`Failed to parse PDF: ${pdfError.message}`);
      }
    } else {
      console.error("[fileProcessing] Unsupported file type:", extension);
      throw new Error(`Unsupported file type: ${extension}`);
    }

    // Validate raw extracted text
    const { isValid: isPreCleanValid, issues: preCleanIssues } = validateTextContent(extractedText);
    console.log("[fileProcessing] Pre-cleaning validation:", {
      isValid: isPreCleanValid,
      issues: preCleanIssues,
      textLength: extractedText.length,
      preview: extractedText.substring(0, 200)
    });

    if (!isPreCleanValid) {
      console.warn("[fileProcessing] Issues found in raw text:", preCleanIssues);
    }

    // Clean the extracted text
    extractedText = cleanText(extractedText);

    // Validate cleaned text
    const { isValid: isPostCleanValid, issues: postCleanIssues } = validateTextContent(extractedText);
    console.log("[fileProcessing] Post-cleaning validation:", {
      isValid: isPostCleanValid,
      issues: postCleanIssues,
      textLength: extractedText.length,
      preview: extractedText.substring(0, 200)
    });

    if (!isPostCleanValid) {
      console.error("[fileProcessing] Invalid text content after cleaning:", postCleanIssues);
      throw new Error(`Text validation failed: ${postCleanIssues.join(', ')}`);
    }

    return extractedText;
  } catch (error) {
    console.error("[fileProcessing] Error extracting text:", {
      error,
      errorName: error.name,
      errorMessage: error.message,
      stackTrace: error.stack
    });
    throw error;
  }
};

export const uploadToStorage = async (file: File, candidateId: string): Promise<string> => {
  console.log("[fileProcessing] Starting file upload to storage for candidate:", candidateId);
  
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