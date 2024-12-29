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

  const validateCandidate = () => {
    if (!candidateId) {
      console.error("Operation attempted without candidate ID");
      toast({
        title: "Error",
        description: "No candidate selected. Please select a candidate first.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCandidate()) return;

    if (!value.trim()) {
      console.error("Submit attempted with empty content");
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
        description: "Failed to save credibility statements. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (!validateCandidate()) return;

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
        title: "Reset Complete",
        description: "Credibility statements have been reset",
      });
    } catch (error) {
      console.error("Error resetting credibility:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset credibility statements. Please try again.",
        variant: "destructive",
      });
    }
  };

  const validateSourcesForMerge = async (): Promise<boolean> => {
    if (!candidateId) return false;

    try {
      const [resumeResponse, linkedInResponse] = await Promise.all([
        supabase
          .from('resume_analyses')
          .select('credibility_statements')
          .eq('candidate_id', candidateId)
          .maybeSingle(),
        supabase
          .from('linkedin_sections')
          .select('analysis')
          .eq('candidate_id', candidateId)
          .eq('section_type', 'about')
          .maybeSingle()
      ]);

      const hasResume = !!resumeResponse.data?.credibility_statements;
      const hasLinkedIn = !!linkedInResponse.data?.analysis;

      if (!hasResume && !hasLinkedIn) {
        toast({
          title: "Missing Data",
          description: "Please upload either a resume or LinkedIn data before merging.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating sources:", error);
      toast({
        title: "Validation Error",
        description: "Failed to validate data sources. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleMerge = async () => {
    if (!validateCandidate()) return;
    
    const hasValidSources = await validateSourcesForMerge();
    if (!hasValidSources) return;

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
      } else {
        throw new Error("No merged statements received");
      }
    } catch (error) {
      console.error("Error merging credibility statements:", error);
      toast({
        title: "Merge Failed",
        description: "Failed to merge credibility statements. Please try again.",
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