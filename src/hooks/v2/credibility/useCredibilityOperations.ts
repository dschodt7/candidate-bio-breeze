import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

export const useCredibilityOperations = (
  candidateId: string | null,
  value: string,
  setIsSubmitted: (value: boolean) => void,
  setIsEditing: (value: boolean) => void,
  setValue: (value: string) => void
) => {
  const { toast } = useToast();
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);

  const handleSubmit = async () => {
    if (!candidateId || !value.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Submitting credibility with value:", value);
      
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          credibility_statement: value,
          credibility_submitted: true
        });

      if (error) throw error;

      setIsSubmitted(true);
      setIsEditing(false);
      
      console.log("Credibility submitted successfully");
      toast({
        title: "Success",
        description: "Credibility statements saved",
      });
    } catch (error) {
      console.error("Error submitting credibility:", error);
      toast({
        title: "Error",
        description: "Failed to save credibility statements",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (!candidateId) return;

    try {
      console.log("Resetting credibility for candidate:", candidateId);
      
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          credibility_statement: null,
          credibility_submitted: false,
          resume_credibility_source: null,
          linkedin_credibility_source: null
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
      setMergeResult(null);
      
      console.log("Credibility reset successfully");
      toast({
        title: "Reset",
        description: "Credibility statements have been reset",
      });
    } catch (error) {
      console.error("Error resetting credibility:", error);
      toast({
        title: "Error",
        description: "Failed to reset credibility statements",
        variant: "destructive",
      });
    }
  };

  const handleMerge = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }
    
    setIsMerging(true);
    try {
      console.log("Starting merge operation for candidate:", candidateId);
      const { data: { data }, error } = await supabase.functions.invoke('merge-credibility-statements', {
        body: { candidateId }
      });

      if (error) throw error;

      if (data?.mergedStatements) {
        const result = data as MergeResult;
        setMergeResult(result);
        setValue(result.mergedStatements.join("\n\n"));
        setIsEditing(true);
        
        toast({
          title: "Success",
          description: "Credibility statements merged successfully",
        });
      }
    } catch (error) {
      console.error("Error merging credibility statements:", error);
      toast({
        title: "Error",
        description: "Failed to merge credibility statements",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  return {
    isMerging,
    mergeResult,
    handleSubmit,
    handleReset,
    handleMerge,
  };
};