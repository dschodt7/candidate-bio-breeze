import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { validateFile } from "@/utils/fileValidation";
import { useFileState } from "@/hooks/useFileState";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { useResumeRetrieval } from "@/hooks/useResumeRetrieval";

export const useFileUpload = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  const { uploadToStorage, updateCandidateResume } = useSupabaseStorage();
  const {
    isDragging,
    setIsDragging,
    file,
    setFile,
    isUploading,
    setIsUploading,
    uploadedFileName,
    setUploadedFileName,
    handleDragOver,
    handleDragLeave
  } = useFileState();

  useResumeRetrieval(candidateId, setUploadedFileName);

  const uploadFile = async (uploadedFile: File) => {
    if (!validateFile(uploadedFile, toast)) return;
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setFile(uploadedFile);
      console.log("Starting file upload process for:", uploadedFile.name);

      const filePath = await uploadToStorage(uploadedFile, candidateId);
      await updateCandidateResume(candidateId, filePath);

      setUploadedFileName(uploadedFile.name);
      toast({
        title: "Success",
        description: "Resume uploaded successfully"
      });
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    await uploadFile(droppedFile);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await uploadFile(selectedFile);
    }
  };

  return {
    isDragging,
    isUploading,
    file,
    uploadedFileName,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput
  };
};