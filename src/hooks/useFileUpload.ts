import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { useFileState } from "@/hooks/useFileState";
import { validateFile } from "@/utils/fileValidation";
import { extractText, uploadToStorage } from "@/utils/fileProcessing";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const candidateId = searchParams.get('candidate');
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { data: fileData } = useQuery({
    queryKey: ['candidateFile', candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('resume_path, original_filename')
        .eq('id', candidateId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!candidateId
  });

  const {
    isDragging,
    setIsDragging,
    file,
    setFile,
    isUploading,
    setIsUploading,
    handleDragOver,
    handleDragLeave
  } = useFileState();

  const handleReset = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete the analysis first
      const { error: deleteAnalysisError } = await supabase
        .from('resume_analyses')
        .delete()
        .eq('candidate_id', candidateId);

      if (deleteAnalysisError) throw deleteAnalysisError;

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

      // Reset local state
      setFile(null);
      setUploadProgress(0);
      
      // Invalidate queries
      await queryClient.invalidateQueries({
        queryKey: ['candidateFile', candidateId]
      });

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
    if (!validateFile(uploadedFile)) return;
    
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

      // Upload file to storage
      setUploadProgress(20);
      const filePath = await uploadToStorage(uploadedFile, candidateId);
      setUploadProgress(50);

      // Extract text based on file type
      let resumeText = null;
      if (uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setUploadProgress(70);
        resumeText = await extractText(uploadedFile);
      } else if (uploadedFile.type === 'application/pdf') {
        setUploadProgress(70);
        const { data, error } = await supabase.functions.invoke('process-pdf', {
          body: { fileName: filePath }
        });

        if (error) throw error;
        if (!data?.text) {
          throw new Error('No text extracted from PDF');
        }
        if (data.text.length > 15000) {
          throw new Error('PDF text exceeds maximum length of 15,000 characters');
        }

        resumeText = data.text;
        setUploadProgress(90);
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
      
      // Invalidate the query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ['candidateFile', candidateId]
      });
      
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
    uploadedFileName: fileData?.original_filename || null,
    uploadProgress,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    handleReset
  };
};