import { validateFile } from "./fileValidation";
import { cleanText } from "./textCleaning";
import { uploadToStorage } from "./storage/fileStorage";
import { extractText } from "./extraction/textExtraction";

export { uploadToStorage, extractText };

// Re-export these for backward compatibility
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return extractText(file);
};

export const extractTextFromDOCX = async (file: File): Promise<string> => {
  return extractText(file);
};