import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { validateFile } from "@/utils/fileValidation";
import { useFileState } from "@/hooks/useFileState";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import mammoth from "mammoth";

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
}

const cleanText = (text: string): string => {
  console.log("Cleaning text, original length:", text.length);
  const cleaned = text
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove replacement characters
    .replace(/[^\x20-\x7E\x0A\x0D\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, ' ') // Replace other problematic Unicode with spaces
    .trim();
  console.log("Text cleaned, new length:", cleaned.length);
  return cleaned;
};

const getFileExtension = (filename: string): string => {
  const parts = filename.toLowerCase().split('.');
  return parts[parts.length - 1];
};

export const useFileUpload = (): FileUploadState => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  const { uploadToStorage } = useSupabaseStorage();
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
          .maybeSingle();

        if (error) throw error;

        if (data?.original_filename) {
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
      const extension = getFileExtension(file.name);
      console.log("File extension detected:", extension);

      let extractedText = '';
      if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
        console.log("Successfully extracted text from DOCX, length:", extractedText.length);
      } else if (extension === 'pdf') {
        extractedText = await file.text();
        console.log("Successfully extracted text from PDF, length:", extractedText.length);
      } else {
        throw new Error(`Unsupported file type: ${extension}`);
      }

      // Clean the extracted text
      const cleanedText = cleanText(extractedText);
      console.log("Text cleaned, final length:", cleanedText.length);
      return cleanedText;

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

      // Extract and clean text first
      setUploadProgress(10);
      const cleanedText = await extractText(uploadedFile);
      setUploadProgress(30);
      console.log("Text extracted and cleaned, length:", cleanedText.length);

      // Upload file to storage with proper extension
      const filePath = await uploadToStorage(uploadedFile, candidateId);
      setUploadProgress(60);
      console.log("File uploaded to storage:", filePath);
      
      // Update candidate record with file info and cleaned text
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          resume_path: filePath,
          original_filename: uploadedFile.name,
          resume_text: cleanedText
        })
        .eq('id', candidateId);

      if (updateError) {
        console.error("Error updating candidate record:", updateError);
        throw updateError;
      }

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
    handleFileInput
  };
};