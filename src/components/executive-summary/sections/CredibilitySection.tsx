import { useState } from "react";
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

  const handleMerge = async () => {
    const result = await handleMergeCredibility();
    if (result) {
      setMergeResult(result);
      onChange(result.mergedStatements.join("\n\n"));
    }
  };

  const handleSubmitCredibility = async () => {
    const success = await handleSubmit(value);
    if (success) {
      onSubmit();
    }
  };

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