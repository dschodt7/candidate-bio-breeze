import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

export const useFileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

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
  }, [candidateId, toast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (uploadedFile: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const uploadFile = async (uploadedFile: File) => {
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

      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading file for candidate:", candidateId);
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, uploadedFile);

      if (uploadError) {
        throw uploadError;
      }

      console.log("File uploaded to storage:", filePath);

      const { error: updateError } = await supabase
        .from('candidates')
        .update({ resume_path: filePath })
        .eq('id', candidateId);

      if (updateError) {
        throw updateError;
      }

      console.log("Resume path updated in database");
      setUploadedFileName(uploadedFile.name);
      
      toast({
        title: "Success",
        description: "Resume uploaded successfully"
      });
    } catch (error) {
      console.error("Error uploading file:", error);
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