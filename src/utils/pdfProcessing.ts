import * as pdfParse from 'pdf-parse';

const MAX_RESUME_LENGTH = 15000;

export const extractPDFText = async (file: File): Promise<string> => {
  console.log("[pdfProcessing] Starting PDF text extraction");
  
  try {
    // Convert File to ArrayBuffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    
    console.log("[pdfProcessing] Parsing PDF content");
    const result = await pdfParse(pdfData);
    console.log("[pdfProcessing] Raw PDF text extracted, length:", result.text.length);
    
    // Clean the extracted text
    const cleanedText = cleanPDFText(result.text);
    console.log("[pdfProcessing] Text cleaned, final length:", cleanedText.length);
    
    return cleanedText;
  } catch (error) {
    console.error("[pdfProcessing] Error extracting PDF text:", error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

const cleanPDFText = (text: string): string => {
  console.log("[pdfProcessing] Starting PDF text cleaning, original length:", text.length);
  
  // Step 1: Remove PDF metadata and control characters
  let cleaned = text
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove replacement characters
    .replace(/[^\x20-\x7E\x0A\x0D\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, ' '); // Replace other problematic Unicode
  
  console.log("[pdfProcessing] Basic character cleaning complete");

  // Step 2: Normalize whitespace and line breaks
  cleaned = cleaned
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[\r\n]+/g, '\n') // Normalize line endings
    .trim();
  
  console.log("[pdfProcessing] Whitespace normalized");

  // Step 3: Remove PDF-specific artifacts
  cleaned = cleaned
    .replace(/^(?:(?![\n\r])[^\w\s])+/gm, '') // Remove leading non-word characters
    .replace(/(?:\/Type|\/Pages|\/MediaBox|\/Resources|\/Font).*$/gm, '') // Remove PDF metadata
    .replace(/\b[A-Z]{6,}\b/g, '') // Remove long uppercase strings (likely PDF artifacts)
    .trim();
  
  console.log("[pdfProcessing] PDF artifacts removed");

  // Step 4: Enforce maximum length
  if (cleaned.length > MAX_RESUME_LENGTH) {
    console.log(`[pdfProcessing] Text exceeds ${MAX_RESUME_LENGTH} characters, truncating...`);
    cleaned = cleaned.slice(0, MAX_RESUME_LENGTH);
  }

  console.log("[pdfProcessing] Final cleaned text length:", cleaned.length);
  return cleaned;
};