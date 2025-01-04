import { useToast } from "@/hooks/use-toast";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const validateFile = (file: File, toast: ReturnType<typeof useToast>['toast']) => {
  console.log("[fileValidation] Validating file:", {
    name: file.name,
    type: file.type,
    size: file.size
  });

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    console.log("[fileValidation] Invalid file type:", file.type);
    toast({
      title: "Invalid file type",
      description: "Please upload a PDF or Word document",
      variant: "destructive"
    });
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    console.log("[fileValidation] File too large:", {
      size: file.size,
      maxSize: MAX_FILE_SIZE,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
    });
    toast({
      title: "File too large",
      description: "Please upload a file smaller than 5MB",
      variant: "destructive"
    });
    return false;
  }

  console.log("[fileValidation] File validation successful");
  return true;
};