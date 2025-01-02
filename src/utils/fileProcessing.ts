import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import * as pdfParse from 'pdf-parse';
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
    size: file.size
  });
  
  try {
    const extension = getFileExtension(file.name);
    console.log("[fileProcessing] File extension detected:", extension);

    let extractedText = '';
    if (extension === 'docx') {
      console.log("[fileProcessing] Processing DOCX file");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value;
      console.log("[fileProcessing] Raw DOCX text extracted, length:", extractedText.length);
    } else if (extension === 'pdf') {
      console.log("[fileProcessing] Processing PDF file");
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      
      // Validation Checkpoint 1: PDF Data
      console.log("[fileProcessing] PDF data stats:", {
        size: pdfData.length,
        firstBytes: Array.from(pdfData.slice(0, 4)).map(b => b.toString(16)).join(' ')
      });

      const result = await pdfParse(pdfData);
      
      // Validation Checkpoint 2: Raw PDF Text
      console.log("[fileProcessing] Raw PDF extraction results:", {
        textLength: result.text.length,
        preview: result.text.substring(0, 200),
        metadata: {
          pages: result.numpages,
          info: result.info
        }
      });

      extractedText = result.text;
    } else {
      console.log("[fileProcessing] Processing as text file");
      extractedText = await file.text();
    }

    // Validation Checkpoint 3: Pre-Cleaning
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
    const cleanedText = cleanText(extractedText);

    // Validation Checkpoint 4: Post-Cleaning
    const { isValid: isPostCleanValid, issues: postCleanIssues } = validateTextContent(cleanedText);
    console.log("[fileProcessing] Post-cleaning validation:", {
      isValid: isPostCleanValid,
      issues: postCleanIssues,
      textLength: cleanedText.length,
      preview: cleanedText.substring(0, 200)
    });

    if (!isPostCleanValid) {
      console.error("[fileProcessing] Invalid text content after cleaning:", postCleanIssues);
      throw new Error(`Text validation failed: ${postCleanIssues.join(', ')}`);
    }

    return cleanedText;
  } catch (error) {
    console.error("[fileProcessing] Error extracting text:", error);
    throw error;
  }
};