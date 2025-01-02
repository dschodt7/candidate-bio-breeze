import mammoth from 'npm:mammoth@1.6.0';
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import * as pdfParse from 'npm:pdf-parse';

const validateExtractedText = (text: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!text || text.trim().length === 0) {
    issues.push("Empty text content");
    return { isValid: false, issues };
  }

  // Check for minimum meaningful content
  const meaningfulContent = text.replace(/[^a-zA-Z0-9]/g, '').length;
  if (meaningfulContent < 100) {
    issues.push("Insufficient meaningful content");
  }

  // Check for common PDF artifacts
  if (text.includes('/Type') || text.includes('/Pages') || text.includes('/MediaBox')) {
    issues.push("Contains PDF structural artifacts");
  }

  // Check for excessive special characters
  const specialCharRatio = (text.length - meaningfulContent) / text.length;
  if (specialCharRatio > 0.5) {
    issues.push("High ratio of special characters");
  }

  return { 
    isValid: issues.length === 0,
    issues 
  };
};

const cleanText = (text: string): string => {
  console.log('[analyze-resume/textExtraction] Starting text cleaning, original length:', text.length);
  
  return text
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove replacement characters
    .replace(/[^\x20-\x7E\x0A\x0D\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, ' ') // Replace other problematic Unicode
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
};

export const extractTextFromFile = async (file: Blob, fileExtension: string): Promise<string> => {
  console.log('[analyze-resume/textExtraction] Starting text extraction for', fileExtension, 'file');
  
  try {
    let extractedText = '';
    
    if (fileExtension === 'docx') {
      console.log('[analyze-resume/textExtraction] Processing DOCX file');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value;
    } else if (fileExtension === 'pdf') {
      console.log('[analyze-resume/textExtraction] Processing PDF file');
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      
      // Log PDF metadata
      console.log('[analyze-resume/textExtraction] PDF data size:', pdfData.length);
      
      const result = await pdfParse(pdfData);
      console.log('[analyze-resume/textExtraction] PDF parse result:', {
        pages: result.numpages,
        info: result.info,
        version: result.version,
        textLength: result.text.length
      });
      
      extractedText = result.text;
    } else {
      console.log('[analyze-resume/textExtraction] Processing as text file');
      extractedText = await file.text();
    }

    // Validation checkpoint: Raw extraction
    const rawValidation = validateExtractedText(extractedText);
    console.log('[analyze-resume/textExtraction] Raw text validation:', rawValidation);

    if (!rawValidation.isValid) {
      console.error('[analyze-resume/textExtraction] Raw text validation failed:', rawValidation.issues);
    }

    // Clean the text
    const cleanedText = cleanText(extractedText);
    
    // Validation checkpoint: Cleaned text
    const cleanedValidation = validateExtractedText(cleanedText);
    console.log('[analyze-resume/textExtraction] Cleaned text validation:', cleanedValidation);

    if (!cleanedValidation.isValid) {
      console.error('[analyze-resume/textExtraction] Cleaned text validation failed:', cleanedValidation.issues);
      throw new Error(`Text validation failed: ${cleanedValidation.issues.join(', ')}`);
    }

    console.log('[analyze-resume/textExtraction] Final text length:', cleanedText.length);
    return cleanedText;
  } catch (error) {
    console.error('[analyze-resume/textExtraction] Error extracting text:', error);
    throw new Error(`Failed to extract text from ${fileExtension} file: ${error.message}`);
  }
};