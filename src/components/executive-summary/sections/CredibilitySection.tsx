import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CredibilityHeader } from "./credibility/CredibilityHeader";
import { CredibilityInput } from "./credibility/CredibilityInput";
import { SourceAnalysis } from "./credibility/SourceAnalysis";
import { useCredibilityState } from "./credibility/useCredibilityState";

interface CredibilitySectionProps {
  candidateId: string | null;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const CredibilitySection = ({ 
  candidateId,
  value,
  onChange,
  onSubmit
}: CredibilitySectionProps) => {
  const { toast } = useToast();
  const {
    mergeResult,
    setMergeResult,
    isMerging,
    setIsMerging,
    hasResume,
    hasLinkedIn,
    hasScreening,
    isSubmitted,
    setIsSubmitted,
  } = useCredibilityState(candidateId);

  const handleMergeCredibility = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsMerging(true);
      setMergeResult(null);
      console.log("Starting credibility merge for candidate:", candidateId);

      const { data, error } = await supabase.functions.invoke('merge-credibility-statements', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("Credibility merge completed:", data);
      if (data?.data) {
        console.log("Merge result:", data.data);
        setMergeResult(data.data);
        onChange(data.data.mergedStatements.join("\n\n"));
      }
      
      toast({
        title: "Success",
        description: "Credibility statements have been merged successfully.",
      });
    } catch (error) {
      console.error("Error merging credibility statements:", error);
      toast({
        title: "Merge Failed",
        description: "There was an error merging the credibility statements.",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  const handleSubmit = async () => {
    if (!candidateId || !value.trim()) return;

    try {
      console.log("Submitting credibility statements for candidate:", candidateId);
      
      const { error } = await supabase
        .from('executive_summaries')
        .update({ 
          brass_tax_criteria: { credibility: value },
          credibility_submitted: true 
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      setIsSubmitted(true);
      onSubmit();
      
      console.log("Credibility statements submitted successfully");
      toast({
        title: "Success",
        description: "Credibility statements saved and locked.",
      });
    } catch (error) {
      console.error("Error saving credibility statements:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save credibility statements.",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (!candidateId) return;

    try {
      console.log("Resetting credibility statements for candidate:", candidateId);
      
      const { error } = await supabase
        .from('executive_summaries')
        .update({ 
          brass_tax_criteria: { credibility: "" },
          credibility_submitted: false 
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      setIsSubmitted(false);
      onChange("");
      
      console.log("Credibility statements reset successfully");
      toast({
        title: "Reset",
        description: "Credibility statements have been reset.",
      });
    } catch (error) {
      console.error("Error resetting credibility statements:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset credibility statements.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <CredibilityHeader
        onMerge={handleMergeCredibility}
        isMerging={isMerging}
        hasResume={hasResume}
        hasLinkedIn={hasLinkedIn}
        hasScreening={hasScreening}
      />

      <div className="space-y-4">
        <CredibilityInput
          value={value}
          onChange={onChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          isSubmitted={isSubmitted}
        />
        <SourceAnalysis mergeResult={mergeResult} />
      </div>
    </div>
  );
};