import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { validateFile } from "@/utils/fileValidation";
import { useFileState } from "@/hooks/useFileState";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import mammoth from "mammoth";

export const useFileUpload = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  const { uploadToStorage, updateCandidateResume } = useSupabaseStorage();
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

  useEffect(() => {
    const fetchResumePath = async () => {
      if (!candidateId) return;

      try {
        console.log("Fetching resume path for candidate:", candidateId);
        const { data, error } = await supabase
          .from('candidates')
          .select('original_filename')
          .eq('id', candidateId)
          .single();

        if (error) throw error;

        if (data.original_filename) {
          console.log("Fetched original filename:", data.original_filename);
          setUploadedFileName(data.original_filename);
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

  const extractText = async (file: File): Promise<string> => {
    console.log("Starting text extraction from file:", file.name);
    try {
      if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log("Successfully extracted text from DOCX, length:", result.value.length);
        return result.value;
      } else {
        const text = await file.text();
        console.log("Successfully extracted text from PDF, length:", text.length);
        return text;
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      throw error;
    }
  };

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
      setUploadProgress(0);
      console.log("Starting file upload process for:", uploadedFile.name);
      toast({
        title: "Processing",
        description: "Starting file upload..."
      });

      // Extract text first
      const extractedText = await extractText(uploadedFile);
      setUploadProgress(30);
      console.log("Text extracted, length:", extractedText.length);

      // Upload file to storage
      const filePath = await uploadToStorage(uploadedFile, candidateId);
      setUploadProgress(60);
      console.log("File uploaded to storage:", filePath);
      
      // Update candidate record with file info and extracted text
      await supabase
        .from('candidates')
        .update({
          resume_path: filePath,
          original_filename: uploadedFile.name,
          resume_text: extractedText
        })
        .eq('id', candidateId);

      setUploadProgress(100);
      console.log("Database updated with file info and text");
      
      setUploadedFileName(uploadedFile.name);
      toast({
        title: "Success",
        description: "Resume uploaded and processed successfully"
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
    handleFileInput
  };
};