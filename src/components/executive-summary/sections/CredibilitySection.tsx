import { useState, useEffect } from "react";
import { CredibilityHeader } from "./credibility/CredibilityHeader";
import { CredibilityInput } from "./credibility/CredibilityInput";
import { SourceAnalysis } from "./credibility/SourceAnalysis";
import { useCredibilityMerge } from "@/hooks/useCredibilityMerge";
import { useCredibilitySourceCheck } from "@/hooks/useCredibilitySourceCheck";
import { useCredibilitySubmission } from "@/hooks/useCredibilitySubmission";

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
  console.log("CredibilitySection rendering with value:", value);
  console.log("CredibilitySection candidateId:", candidateId);

  const {
    mergeResult,
    setMergeResult,
    isMerging,
    handleMergeCredibility
  } = useCredibilityMerge(candidateId);

  const {
    hasResume,
    hasLinkedIn,
    hasScreening,
    isLoading
  } = useCredibilitySourceCheck(candidateId);

  const {
    isSubmitted,
    handleSubmit,
    handleReset
  } = useCredibilitySubmission(candidateId);

  useEffect(() => {
    console.log("CredibilitySection mounted/updated");
    console.log("Current submission state:", isSubmitted);
    console.log("Current merge result:", mergeResult);
    
    return () => {
      console.log("CredibilitySection unmounting");
    };
  }, [isSubmitted, mergeResult]);

  const handleMerge = async () => {
    console.log("Initiating merge operation");
    const result = await handleMergeCredibility();
    console.log("Merge operation result:", result);
    if (result) {
      setMergeResult(result);
      onChange(result.mergedStatements.join("\n\n"));
    }
  };

  const handleSubmitCredibility = async () => {
    console.log("Submitting credibility with value:", value);
    const success = await handleSubmit(value);
    console.log("Submission result:", success);
    if (success) {
      onSubmit();
    }
  };

  console.log("Current render state - isSubmitted:", isSubmitted);
  console.log("Current render state - mergeResult:", mergeResult);

  return (
    <div className="space-y-4">
      <CredibilityHeader
        onMerge={handleMerge}
        isMerging={isMerging}
        hasResume={hasResume}
        hasLinkedIn={hasLinkedIn}
        hasScreening={hasScreening}
      />

      <div className="space-y-4">
        <CredibilityInput
          value={value}
          onChange={onChange}
          onSubmit={handleSubmitCredibility}
          onReset={handleReset}
          isSubmitted={isSubmitted}
          isLoading={isLoading}
        />
        <SourceAnalysis mergeResult={mergeResult} />
      </div>
    </div>
  );
};