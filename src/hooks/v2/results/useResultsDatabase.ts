import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

export const useResultsDatabase = (candidateId: string | null) => {
  const { toast } = useToast();
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);

  const handleSubmit = async (value: string, setIsSubmitted: (value: boolean) => void, setIsEditing: (value: boolean) => void) => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Submitting results achievement to database for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          results_achievements: value,
          results_submitted: true
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("Results achievement submitted successfully");
      setIsSubmitted(true);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Results and achievements saved successfully",
      });
    } catch (error) {
      console.error("Error submitting results achievement:", error);
      toast({
        title: "Error",
        description: "Failed to save results and achievements",
        variant: "destructive",
      });
    }
  };

  const handleReset = async (
    setValue: (value: string) => void,
    setIsSubmitted: (value: boolean) => void,
    setIsEditing: (value: boolean) => void,
    setMergeResult: (value: MergeResult | null) => void
  ) => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Resetting results achievement in database for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          results_achievements: "",
          resume_results_source: null,
          linkedin_results_source: null,
          results_submitted: false
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("Results achievement reset successfully");
      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
      setMergeResult(null);
      toast({
        title: "Success",
        description: "Results and achievements have been reset",
      });
    } catch (error) {
      console.error("Error resetting results achievement:", error);
      toast({
        title: "Error",
        description: "Failed to reset results and achievements",
        variant: "destructive",
      });
    }
  };

  return {
    mergeResult,
    setMergeResult,
    handleSubmit,
    handleReset,
  };
};