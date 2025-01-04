import { supabase } from "@/integrations/supabase/client";

export const uploadToStorage = async (file: File, candidateId: string): Promise<string> => {
  console.log("[fileStorage] Starting file upload to storage for candidate:", candidateId);
  
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    console.log("[fileStorage] Uploading file:", {
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
      console.error("[fileStorage] Storage upload error:", uploadError);
      throw uploadError;
    }

    console.log("[fileStorage] File uploaded successfully:", data);
    return fileName;
  } catch (error) {
    console.error("[fileStorage] Error in storage upload:", error);
    throw error;
  }
};