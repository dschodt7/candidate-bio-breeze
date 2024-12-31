import { useEffect } from "react";
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
    console.log("Extracting text from file:", file.name);
    try {
      if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } else {
        return await file.text();
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
      console.log("Starting file upload process for:", uploadedFile.name);

      // Extract text first
      const extractedText = await extractText(uploadedFile);
      console.log("Text extracted, length:", extractedText.length);

      // Upload file to storage
      const filePath = await uploadToStorage(uploadedFile, candidateId);
      
      // Update candidate record with file info and extracted text
      await supabase
        .from('candidates')
        .update({
          resume_path: filePath,
          original_filename: uploadedFile.name,
          resume_text: extractedText
        })
        .eq('id', candidateId);

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