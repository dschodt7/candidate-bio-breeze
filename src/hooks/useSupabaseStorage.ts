import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSupabaseStorage = () => {
  const { toast } = useToast();

  const uploadToStorage = async (file: File, candidateId: string) => {
    try {
      console.log("Starting file upload to storage for candidate:", candidateId);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      console.log("File uploaded successfully to storage:", filePath);
      return filePath;
    } catch (error) {
      console.error("Error uploading to storage:", error);
      throw error;
    }
  };

  const updateCandidateResume = async (candidateId: string, filePath: string, originalFilename: string) => {
    try {
      console.log("Updating candidate resume path:", filePath);
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ 
          resume_path: filePath,
          original_filename: originalFilename
        })
        .eq('id', candidateId);

      if (updateError) {
        throw updateError;
      }

      console.log("Resume path updated successfully in database");
    } catch (error) {
      console.error("Error updating candidate resume:", error);
      throw error;
    }
  };

  return {
    uploadToStorage,
    updateCandidateResume
  };
};