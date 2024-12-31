import { supabase } from "@/integrations/supabase/client";

export const uploadToStorage = async (file: File, candidateId: string): Promise<string> => {
  console.log("Starting file upload to storage for candidate:", candidateId);
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading to storage:", uploadError);
      throw uploadError;
    }

    console.log("File uploaded successfully to storage:", filePath);
    return filePath;
  } catch (error) {
    console.error("Error in storage upload:", error);
    throw error;
  }
};

export const updateCandidateResume = async (
  candidateId: string,
  filePath: string,
  originalFilename: string,
  resumeText: string
) => {
  console.log("Updating candidate resume information");
  try {
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        resume_path: filePath,
        original_filename: originalFilename,
        resume_text: resumeText
      })
      .eq('id', candidateId);

    if (updateError) {
      console.error("Error updating candidate resume:", updateError);
      throw updateError;
    }

    console.log("Resume information updated successfully");
  } catch (error) {
    console.error("Error in database update:", error);
    throw error;
  }
};