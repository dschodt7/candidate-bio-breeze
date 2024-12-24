import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { validateFile } from "@/utils/fileValidation";
import { useFileState } from "@/hooks/useFileState";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";

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

  useEffect(() => {
    const fetchResumePath = async () => {
      if (!candidateId) return;

      try {
        console.log("Fetching resume path for candidate:", candidateId);
        const { data, error } = await supabase
          .from('candidates')
          .select('resume_path')
          .eq('id', candidateId)
          .single();

        if (error) throw error;

        if (data.resume_path) {
          console.log("Fetched resume path:", data.resume_path);
          setUploadedFileName(data.resume_path.split('/').pop());
        } else {
          setUploadedFileName(null);
        }
      } catch (error) {
        console.error("Error fetching resume path:", error);
        toast({
          title: "Error",
          description: "Failed to load resume information",
          variant: "destructive",
        });
      }
    };

    fetchResumePath();
  }, [candidateId, toast, setUploadedFileName]);

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