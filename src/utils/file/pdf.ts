import { supabase } from "@/integrations/supabase/client";
import { validateTextContent } from "./validation";
import { cleanText } from "../textCleaning";

const PROCESSING_TIMEOUT = 45000; // 45 seconds
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 3000; // 3 seconds

interface PDFProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: {
    pages: number;
    info: any;
    version: string;
  };
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log("[pdfProcessing] Starting PDF text extraction for:", file.name);
  
  try {
    const fileName = await uploadToStorage(file);
    console.log("[pdfProcessing] PDF uploaded to storage:", fileName);

    let lastError: Error | null = null;
    
    // Implement retry logic
    for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[pdfProcessing] Retry attempt ${attempt} of ${RETRY_ATTEMPTS}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }

        const processingPromise = supabase.functions.invoke<PDFProcessingResult>('process-pdf', {
          body: { fileName }
        });

        // Set up timeout
        const timeoutPromise = new Promise<PDFProcessingResult>((_, reject) => {
          setTimeout(() => reject(new Error('PDF processing timeout')), PROCESSING_TIMEOUT);
        });

        // Race between processing and timeout
        const { data } = await Promise.race([processingPromise, timeoutPromise]);

        if (!data?.success || !data.text) {
          throw new Error(data?.error || 'PDF processing failed');
        }

        console.log("[pdfProcessing] PDF processed successfully:", {
          textLength: data.text.length,
          pages: data.metadata?.pages
        });

        // Validate the extracted text
        const { isValid, issues } = validateTextContent(data.text, 'PDF');
        if (!isValid) {
          throw new Error(`PDF validation failed: ${issues.join(', ')}`);
        }

        return cleanText(data.text);
      } catch (error) {
        console.error(`[pdfProcessing] Attempt ${attempt + 1} failed:`, error);
        lastError = error as Error;
        
        // If it's not a timeout, don't retry
        if (error.message !== 'PDF processing timeout') {
          throw error;
        }
      }
    }

    throw lastError || new Error('PDF processing failed after all retry attempts');
  } catch (error) {
    console.error("[pdfProcessing] Error in PDF processing:", error);
    throw error;
  }
};

const uploadToStorage = async (file: File): Promise<string> => {
  const fileName = `${crypto.randomUUID()}.pdf`;
  
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, {
      contentType: 'application/pdf'
    });

  if (uploadError) {
    throw uploadError;
  }

  return fileName;
};