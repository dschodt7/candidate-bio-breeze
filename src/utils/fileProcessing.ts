import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import { cleanText, validateTextContent } from "./textCleaning";
import { supabase } from "@/integrations/supabase/client";

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

      // Clean and validate DOCX text
      const { isValid: isPreCleanValid, issues: preCleanIssues } = validateTextContent(extractedText);
      console.log("[fileProcessing] Pre-cleaning validation:", {
        isValid: isPreCleanValid,
        issues: preCleanIssues,
        textLength: extractedText.length,
        preview: extractedText.substring(0, 200)
      });

      if (!isPreCleanValid) {
        console.error("[fileProcessing] Invalid text content before cleaning:", preCleanIssues);
      }

      extractedText = cleanText(extractedText);

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
    } else if (extension === 'pdf') {
      // For PDFs, we'll just return a placeholder as the text will be processed server-side
      console.log("[fileProcessing] PDF file detected, deferring text extraction to server");
      return "PDF_PROCESSING_DEFERRED";
    } else {
      console.log("[fileProcessing] Processing as text file");
      extractedText = await file.text();
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