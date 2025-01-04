import mammoth from "mammoth";
import { validateTextContent } from "./validation";
import { cleanText } from "../textCleaning";

export const extractTextFromDOCX = async (file: File): Promise<string> => {
  console.log("[docxProcessing] Starting DOCX text extraction for:", file.name);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log("[docxProcessing] DOCX ArrayBuffer size:", arrayBuffer.byteLength);
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    const extractedText = result.value;
    console.log("[docxProcessing] Raw DOCX text extracted, length:", extractedText.length);

    // Validate with DOCX-specific rules
    const { isValid, issues } = validateTextContent(extractedText, 'DOCX');
    
    if (!isValid) {
      throw new Error(`DOCX validation failed: ${issues.join(', ')}`);
    }
    
    return cleanText(extractedText);
  } catch (error) {
    console.error("[docxProcessing] Error in DOCX text extraction:", error);
    throw error;
  }
};