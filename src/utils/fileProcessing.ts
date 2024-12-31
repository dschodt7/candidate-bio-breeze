import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import { cleanText } from "./textCleaning";

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
  console.log("Starting text extraction from file:", file.name);
  try {
    const extension = getFileExtension(file.name);
    console.log("File extension detected:", extension);

    let extractedText = '';
    if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value;
      console.log("Successfully extracted text from DOCX, length:", extractedText.length);
    } else if (extension === 'pdf') {
      extractedText = await file.text();
      console.log("Successfully extracted text from PDF, length:", extractedText.length);
    } else {
      throw new Error(`Unsupported file type: ${extension}`);
    }

    // Clean the extracted text
    const cleanedText = cleanText(extractedText);
    console.log("Text cleaned, final length:", cleanedText.length);
    return cleanedText;

  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
};