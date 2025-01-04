import { FILE_CONSTANTS, type AllowedFileType } from './constants';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFileType = (fileType: string): fileType is AllowedFileType => {
  return FILE_CONSTANTS.ALLOWED_TYPES.includes(fileType as AllowedFileType);
};

export const validateFileSize = (fileSize: number): ValidationResult => {
  console.log("[fileValidation] Checking file size:", {
    size: fileSize,
    maxSize: FILE_CONSTANTS.MAX_FILE_SIZE,
    sizeInMB: fileSize / (1024 * 1024)
  });

  if (fileSize > FILE_CONSTANTS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 5MB limit. Your file is ${(fileSize / (1024 * 1024)).toFixed(1)}MB.`
    };
  }

  return { isValid: true };
};

export const validateFile = (file: File, toast: ReturnType<typeof useToast>['toast']): boolean => {
  console.log("[fileValidation] Validating file:", {
    name: file.name,
    type: file.type,
    size: file.size
  });

  // Check file type
  if (!validateFileType(file.type)) {
    console.error("[fileValidation] Invalid file type:", file.type);
    toast({
      title: "Invalid file type",
      description: "Please upload a PDF or Word document",
      variant: "destructive"
    });
    return false;
  }

  // Check file size
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.isValid) {
    console.error("[fileValidation] File too large:", {
      size: file.size,
      maxSize: FILE_CONSTANTS.MAX_FILE_SIZE
    });
    toast({
      title: "File too large",
      description: sizeValidation.error,
      variant: "destructive"
    });
    return false;
  }

  console.log("[fileValidation] File validation successful");
  return true;
};