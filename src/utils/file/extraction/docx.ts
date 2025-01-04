import mammoth from "mammoth";
import { validateTextContent } from "@/utils/file/validation";
import { TextExtractionError } from "@/utils/file/types";

export const extractTextFromDOCX = async (file: File): Promise<string> => {
  console.log("[fileProcessing] Starting DOCX text extraction for:", file.name);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log("[fileProcessing] DOCX ArrayBuffer size:", arrayBuffer.byteLength);
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    const extractedText = result.value;
    console.log("[fileProcessing] Raw DOCX text extracted, length:", extractedText.length);

    // Validate with DOCX-specific rules
    const { isValid, issues } = validateTextContent(extractedText, 'DOCX');
    
    if (!isValid) {
      throw new TextExtractionError(
        `DOCX validation failed: ${issues.join(', ')}`,
        'DOCX_PARSING',
        { issues, textLength: extractedText.length }
      );
    }
    
    return extractedText;
  } catch (error) {
    console.error("[fileProcessing] Error in DOCX text extraction:", error);
    if (error instanceof TextExtractionError) {
      throw error;
    }
    throw new TextExtractionError(
      'Failed to extract text from DOCX',
      'DOCX_PARSING',
      error
    );
  }
};