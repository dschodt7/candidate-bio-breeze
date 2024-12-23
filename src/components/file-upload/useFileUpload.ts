import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      setIsUploading(true);
      setFile(uploadedFile);

      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, uploadedFile);

      if (uploadError) {
        throw uploadError;
      }

      console.log("File uploaded to storage:", filePath);

      const { error: dbError } = await supabase
        .from('candidates')
        .insert({
          profile_id: user.id,
          resume_path: filePath
        });

      if (dbError) {
        throw dbError;
      }

      console.log("Candidate record created with resume path:", filePath);
      
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
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput
  };
};