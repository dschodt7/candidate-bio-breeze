import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";
import { cleanText, validateTextContent } from "./textCleaning";
import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const getFileExtension = (filename: string): string => {
  const parts = filename.toLowerCase().split('.');
  return parts[parts.length - 1];
};

export const validateFile = (file: File, toast: ReturnType<typeof useToast>['toast']) => {
  console.log("[fileProcessing] Validating file:", {
    name: file.name,
    type: file.type,
    size: file.size,
    extension: getFileExtension(file.name)
  });
  
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    console.error("[fileProcessing] Invalid file type:", file.type);
    toast({
      title: "Invalid file type",
      description: "Please upload a PDF or Word document",
      variant: "destructive"
    });
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    console.error("[fileProcessing] File too large:", file.size);
    toast({
      title: "File too large",
      description: "Please upload a file smaller than 10MB",
      variant: "destructive"
    });
    return false;
  }

  return true;
};

export const extractText = async (file: File): Promise<string> => {
  console.log("[fileProcessing] Starting text extraction from file:", {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString()
  });
  
  try {
    const extension = getFileExtension(file.name);
    console.log("[fileProcessing] File extension detected:", extension);

    let extractedText = '';
    
    if (extension === 'docx') {
      console.log("[fileProcessing] Processing DOCX file");
      const arrayBuffer = await file.arrayBuffer();
      console.log("[fileProcessing] DOCX ArrayBuffer size:", arrayBuffer.byteLength);
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value;
      console.log("[fileProcessing] Raw DOCX text extracted, length:", extractedText.length);
    } 
    else if (extension === 'pdf') {
      console.log("[fileProcessing] Processing PDF file");
      
      // First upload the file to storage
      const fileExt = getFileExtension(file.name);
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log("[fileProcessing] Uploading PDF to storage:", fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        console.error("[fileProcessing] Storage upload error:", uploadError);
        throw new Error(`Failed to upload PDF: ${uploadError.message}`);
      }

      console.log("[fileProcessing] PDF uploaded successfully, calling process-pdf function");
      
      // Now call the process-pdf edge function with the stored file name
      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: { fileName }
      });

      if (error) {
        console.error("[fileProcessing] Edge function error:", error);
        throw error;
      }

      if (!data || !data.text) {
        console.error("[fileProcessing] No text returned from edge function:", data);
        throw new Error('No text content returned from PDF processing');
      }

      extractedText = data.text;
      console.log("[fileProcessing] PDF text extracted via Edge Function, length:", extractedText.length);
    } else {
      console.error("[fileProcessing] Unsupported file type:", extension);
      throw new Error(`Unsupported file type: ${extension}`);
    }

    // Validate extracted text
    const { isValid, issues } = validateTextContent(extractedText);
    console.log("[fileProcessing] Text validation:", { isValid, issues });

    if (!isValid) {
      console.error("[fileProcessing] Invalid text content:", issues);
      throw new Error(`Text validation failed: ${issues.join(', ')}`);
    }

    // Clean the text
    extractedText = cleanText(extractedText);
    return extractedText;
  } catch (error) {
    console.error("[fileProcessing] Error extracting text:", error);
    throw error;
  }
};

export const uploadToStorage = async (file: File, candidateId: string): Promise<string> => {
  console.log("[fileProcessing] Starting file upload to storage for candidate:", candidateId);
  
  try {
    const fileExt = getFileExtension(file.name);
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    console.log("[fileProcessing] Uploading file:", {
      originalName: file.name,
      sanitizedName: sanitizedFileName,
      storagePath: fileName,
      size: file.size
    });

    const { data, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("[fileProcessing] Storage upload error:", uploadError);
      throw uploadError;
    }

    console.log("[fileProcessing] File uploaded successfully:", data);
    return fileName;
  } catch (error) {
    console.error("[fileProcessing] Error in storage upload:", error);
    throw error;
  }
};