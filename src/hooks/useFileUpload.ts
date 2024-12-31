import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { useFileState } from "@/hooks/useFileState";
import { validateFile, extractText } from "@/utils/fileProcessing";
import { uploadToStorage, updateCandidateResume } from "@/utils/storageUtils";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadState {
  isDragging: boolean;
  isUploading: boolean;
  file: File | null;
  uploadedFileName: string | null;
  uploadProgress: number;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReset: () => void;
}

export const useFileUpload = (): FileUploadState => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [uploadProgress, setUploadProgress] = useState(0);
  
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

  const handleReset = async () => {
    const candidateId = searchParams.get('candidate');
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Resetting resume and analysis for candidate:", candidateId);
      
      // Reset the resume information
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          resume_path: null,
          original_filename: null,
          resume_text: null
        })
        .eq('id', candidateId);

      if (updateError) throw updateError;

      // Delete the analysis
      const { error: deleteError } = await supabase
        .from('resume_analyses')
        .delete()
        .eq('candidate_id', candidateId);

      if (deleteError) throw deleteError;

      // Reset local state
      setFile(null);
      setUploadedFileName(null);
      setUploadProgress(0);

      console.log("Reset completed successfully");
      toast({
        title: "Success",
        description: "Resume and analysis have been reset",
      });
    } catch (error) {
      console.error("Error resetting resume:", error);
      toast({
        title: "Reset Failed",
        description: "There was an error resetting the resume",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (uploadedFile: File) => {
    if (!validateFile(uploadedFile, toast)) return;
    
    const candidateId = searchParams.get('candidate');
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
      setUploadProgress(0);
      console.log("Starting file upload process for:", uploadedFile.name);

      // Extract and clean text
      setUploadProgress(10);
      const cleanedText = await extractText(uploadedFile);
      setUploadProgress(30);
      console.log("Text extracted and cleaned, length:", cleanedText.length);

      // Upload file to storage
      const filePath = await uploadToStorage(uploadedFile, candidateId);
      setUploadProgress(60);
      console.log("File uploaded to storage:", filePath);
      
      // Update candidate record
      await updateCandidateResume(candidateId, filePath, uploadedFile.name, cleanedText);
      setUploadProgress(100);
      console.log("Database updated with file info and cleaned text");
      
      setUploadedFileName(uploadedFile.name);
      toast({
        title: "Success",
        description: "Resume uploaded and processed successfully"
      });
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
    uploadProgress,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    handleReset
  };
};
