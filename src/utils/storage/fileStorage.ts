import { supabase } from "@/integrations/supabase/client";

interface StorageError extends Error {
  type: 'UPLOAD' | 'DELETE' | 'VALIDATION';
  details?: unknown;
}

class FileStorageError extends Error implements StorageError {
  type: StorageError['type'];
  details?: unknown;

  constructor(message: string, type: StorageError['type'], details?: unknown) {
    super(message);
    this.type = type;
    this.details = details;
    this.name = 'FileStorageError';
  }
}

export const uploadToStorage = async (file: File, candidateId: string): Promise<string> => {
  console.log("[fileStorage] Starting file upload to storage for candidate:", candidateId);
  
  try {
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
    const fileExt = sanitizedFileName.split('.').pop()?.toLowerCase() || '';
    
    // Include candidateId in the file path for proper scoping
    const filePath = `${candidateId}/${crypto.randomUUID()}.${fileExt}`;
    
    console.log("[fileStorage] Uploading file:", {
      originalName: file.name,
      sanitizedName: sanitizedFileName,
      storagePath: filePath,
      size: file.size
    });

    const { data, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("[fileStorage] Storage upload error:", uploadError);
      throw new FileStorageError(
        `Failed to upload file: ${uploadError.message}`,
        'UPLOAD',
        uploadError
      );
    }

    console.log("[fileStorage] File uploaded successfully:", data);
    return filePath;
  } catch (error) {
    console.error("[fileStorage] Error in storage upload:", error);
    if (error instanceof FileStorageError) {
      throw error;
    }
    throw new FileStorageError(
      'Unexpected error during file upload',
      'UPLOAD',
      error
    );
  }
};