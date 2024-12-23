import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useSupabase = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const uploadResume = async (file: File) => {
    try {
      setIsLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      console.log('Resume uploaded successfully:', filePath);
      return filePath;
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload resume. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveCandidateData = async (
    linkedinUrl: string,
    screeningNotes: string,
    resumePath: string | null
  ) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .insert([
          {
            linkedin_url: linkedinUrl,
            screening_notes: screeningNotes,
            resume_path: resumePath,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('Candidate data saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error saving candidate data:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save candidate data. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveExecutiveSummary = async (
    candidateId: string,
    brassTaxCriteria: Record<string, string>,
    sensoryCriteria: Record<string, string>
  ) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('executive_summaries')
        .insert([
          {
            candidate_id: candidateId,
            brass_tax_criteria: brassTaxCriteria,
            sensory_criteria: sensoryCriteria,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('Executive summary saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error saving executive summary:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save executive summary. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    uploadResume,
    saveCandidateData,
    saveExecutiveSummary,
  };
};