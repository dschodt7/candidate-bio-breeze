import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { useFileState } from "@/hooks/useFileState";
import { validateFile, extractText, uploadToStorage } from "@/utils/fileProcessing";
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
      
      // Delete the analysis first
      console.log("Deleting resume analysis");
      const { error: deleteAnalysisError } = await supabase
        .from('resume_analyses')
        .delete()
        .eq('candidate_id', candidateId);

      if (deleteAnalysisError) throw deleteAnalysisError;
      console.log("Resume analysis deleted successfully");

      // Reset the resume information
      console.log("Resetting resume information");
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          resume_path: null,
          original_filename: null,
          resume_text: null
        })
        .eq('id', candidateId);

      if (updateError) throw updateError;
      console.log("Resume information reset successfully");

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

  const processFile = async (uploadedFile: File) => {
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

      // Upload file to storage
      setUploadProgress(20);
      const filePath = await uploadToStorage(uploadedFile, candidateId);
      setUploadProgress(50);
      console.log("File uploaded to storage:", filePath);

      // Extract text if it's a DOCX file
      let resumeText = null;
      if (uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setUploadProgress(70);
        resumeText = await extractText(uploadedFile);
        console.log("Text extracted from DOCX, length:", resumeText?.length);
      }

      // Update candidate record
      setUploadProgress(90);
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          resume_path: filePath,
          original_filename: uploadedFile.name,
          resume_text: resumeText
        })
        .eq('id', candidateId);

      if (updateError) throw updateError;
      
      setUploadProgress(100);
      setUploadedFileName(uploadedFile.name);
      console.log("Upload process completed successfully");
      
      toast({
        title: "Success",
        description: "Resume uploaded successfully"
      });
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file",
        variant: "destructive"
      });
      setFile(null);
      setUploadedFileName(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    await processFile(droppedFile);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
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