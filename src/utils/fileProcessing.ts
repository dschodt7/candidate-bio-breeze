import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import { cleanText, validateTextContent } from "./textCleaning";

export const getFileExtension = (filename: string): string => {
  const parts = filename.toLowerCase().split('.');
  return parts[parts.length - 1];
};

export const validateFile = (file: File, toast: ReturnType<typeof useToast>['toast']) => {
  console.log("[fileProcessing] Validating file:", file.name);
  
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

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
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
  console.log("[fileProcessing] Starting text extraction from file:", file.name);
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
      const text = await file.text();
      console.log("[fileProcessing] Raw PDF text extracted, length:", text.length);
      
      if (!validateTextContent(text)) {
        throw new Error("Invalid or corrupted PDF content");
      }
      
      extractedText = text;
    } else {
      throw new Error(`Unsupported file type: ${extension}`);
    }

    // Clean the extracted text
    const cleanedText = cleanText(extractedText);
    console.log("[fileProcessing] Text cleaned, final length:", cleanedText.length);

    if (!validateTextContent(cleanedText)) {
      throw new Error("Text cleaning resulted in invalid content");
    }

    return cleanedText;
  } catch (error) {
    console.error("[fileProcessing] Error extracting text:", error);
    throw error;
  }
};