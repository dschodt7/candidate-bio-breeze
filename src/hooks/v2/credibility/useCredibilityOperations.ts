import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";
import { useCredibilityValidation } from "./validation/useCredibilityValidation";
import { useCredibilityDatabase } from "./database/useCredibilityDatabase";

export const useCredibilityOperations = (
  candidateId: string | null,
  value: string,
  setIsSubmitted: (value: boolean) => void,
  setIsEditing: (value: boolean) => void,
  setValue: (value: string) => void
) => {
  // Initialize all hooks at the top level
  const { toast } = useToast();
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const { validateCandidate, validateSourcesForMerge } = useCredibilityValidation(candidateId);
  const { submitToDatabase, resetInDatabase } = useCredibilityDatabase(candidateId);

  console.log("Initializing credibility operations hook for candidate:", candidateId);

  const showToast = (title: string, description: string, type: "success" | "error" = "success") => {
    toast({
      title,
      description,
      variant: type === "error" ? "destructive" : "default",
    });
  };

  const handleSubmit = async () => {
    if (!validateCandidate()) return;

    if (!value.trim()) {
      console.error("Submit attempted with empty content");
      showToast("Error", "Please enter some content before submitting", "error");
      return;
    }

    const success = await submitToDatabase(value);
    if (success) {
      setIsSubmitted(true);
      setIsEditing(false);
    }
  };

  const handleReset = async () => {
    if (!validateCandidate()) return;

    const success = await resetInDatabase();
    if (success) {
      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
      setMergeResult(null);
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
        
        showToast("Success", "Credibility statements merged successfully");
      } else {
        throw new Error("No merged statements received");
      }
    } catch (error) {
      console.error("Error merging credibility statements:", error);
      showToast(
        "Merge Failed",
        "Failed to merge credibility statements. Please try again.",
        "error"
      );
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