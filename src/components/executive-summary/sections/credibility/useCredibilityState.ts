import { useCredibilityMerge } from "@/hooks/useCredibilityMerge";
import { useCredibilitySourceCheck } from "@/hooks/useCredibilitySourceCheck";
import { useCredibilitySubmission } from "@/hooks/useCredibilitySubmission";

export const useCredibilityState = (candidateId: string | null) => {
  const {
    mergeResult,
    setMergeResult,
    isMerging,
    setIsMerging
  } = useCredibilityMerge(candidateId);

  const {
    hasResume,
    hasLinkedIn,
    hasScreening,
    isLoading
  } = useCredibilitySourceCheck(candidateId);

  const {
    isSubmitted,
    setIsSubmitted
  } = useCredibilitySubmission(candidateId);

  return {
    mergeResult,
    setMergeResult,
    isMerging,
    setIsMerging,
    hasResume,
    hasLinkedIn,
    hasScreening,
    isSubmitted,
    setIsSubmitted,
    isLoading,
  };
};