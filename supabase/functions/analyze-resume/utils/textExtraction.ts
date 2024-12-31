import mammoth from 'npm:mammoth@1.6.0';
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import * as pdfParse from 'npm:pdf-parse';

const cleanText = (text: string): string => {
  // Remove null bytes and other problematic characters
  return text
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove replacement characters
    .trim();
};

export const extractTextFromFile = async (file: Blob, fileExtension: string): Promise<string> => {
  console.log('[analyze-resume/textExtraction] Starting text extraction for', fileExtension, 'file');
  
  try {
    if (fileExtension === 'docx') {
      console.log('[analyze-resume/textExtraction] Processing DOCX file');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = cleanText(result.value);
      console.log('[analyze-resume/textExtraction] DOCX text extracted, length:', text.length);
      return text;
    } else if (fileExtension === 'pdf') {
      console.log('[analyze-resume/textExtraction] Processing PDF file');
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      const result = await pdfParse(pdfData);
      const text = cleanText(result.text);
      console.log('[analyze-resume/textExtraction] PDF text extracted, length:', text.length);
      return text;
    } else {
      console.log('[analyze-resume/textExtraction] Processing as text file');
      const text = cleanText(await file.text());
      console.log('[analyze-resume/textExtraction] Text extracted, length:', text.length);
      return text;
    }
  } catch (error) {
    console.error('[analyze-resume/textExtraction] Error extracting text:', error);
    throw new Error(`Failed to extract text from ${fileExtension} file: ${error.message}`);
  }
};