import mammoth from 'npm:mammoth@1.6.0';

export const extractTextFromFile = async (file: Blob, fileExtension: string): Promise<string> => {
  console.log('[analyze-resume/textExtraction] Starting text extraction for', fileExtension, 'file');
  
  try {
    if (fileExtension === 'docx') {
      console.log('[analyze-resume/textExtraction] Processing DOCX file');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      console.log('[analyze-resume/textExtraction] DOCX text extracted, length:', text.length);
      return text;
    } else {
      console.log('[analyze-resume/textExtraction] Processing as text file');
      const text = await file.text();
      console.log('[analyze-resume/textExtraction] Text extracted, length:', text.length);
      return text;
    }
  } catch (error) {
    console.error('[analyze-resume/textExtraction] Error extracting text:', error);
    throw new Error(`Failed to extract text from ${fileExtension} file: ${error.message}`);
  }
};