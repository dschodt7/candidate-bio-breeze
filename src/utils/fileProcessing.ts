import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import { cleanText, validateTextContent } from "./textCleaning";

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
    } else if (extension === 'pdf') {
      console.log("[fileProcessing] Starting PDF conversion to base64");
      console.time("[fileProcessing] PDF base64 conversion");
      
      const arrayBuffer = await file.arrayBuffer();
      console.log("[fileProcessing] PDF ArrayBuffer obtained, size:", arrayBuffer.byteLength);
      
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log("[fileProcessing] Uint8Array created, length:", uint8Array.length);
      
      try {
        console.log("[fileProcessing] Starting string conversion");
        const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
        console.log("[fileProcessing] Base64 conversion completed, length:", base64String.length);
        console.timeEnd("[fileProcessing] PDF base64 conversion");
        return base64String;
      } catch (conversionError) {
        console.error("[fileProcessing] Error during base64 conversion:", {
          error: conversionError,
          errorName: conversionError.name,
          errorMessage: conversionError.message,
          stackTrace: conversionError.stack
        });
        throw new Error(`Base64 conversion failed: ${conversionError.message}`);
      }
    } else {
      console.log("[fileProcessing] Processing as text file");
      extractedText = await file.text();
    }

    // Only clean and validate if it's not a PDF (PDFs will be processed server-side)
    if (extension !== 'pdf') {
      // Validation checkpoint: Pre-Cleaning
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

      // Clean the text
      extractedText = cleanText(extractedText);

      // Validation checkpoint: Post-Cleaning
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