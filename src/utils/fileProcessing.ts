import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import { extractPDFText } from "./pdfProcessing";

export const getFileExtension = (filename: string): string => {
  const parts = filename.toLowerCase().split('.');
  return parts[parts.length - 1];
};

export const validateFile = (file: File, toast: ReturnType<typeof useToast>['toast']) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    toast({
      title: "Invalid file type",
      description: "Please upload a PDF or Word document",
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
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value;
      console.log("[fileProcessing] Successfully extracted text from DOCX, length:", extractedText.length);
    } else if (extension === 'pdf') {
      extractedText = await extractPDFText(file);
      console.log("[fileProcessing] Successfully extracted text from PDF, length:", extractedText.length);
    } else {
      throw new Error(`Unsupported file type: ${extension}`);
    }

    return extractedText;
  } catch (error) {
    console.error("[fileProcessing] Error extracting text:", error);
    throw error;
  }
};