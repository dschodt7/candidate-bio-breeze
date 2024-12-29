import { useCredibilityState } from "./credibility/useCredibilityState";
import { useCredibilitySubmission } from "./credibility/useCredibilitySubmission";
import { useCredibilityMerge } from "./credibility/useCredibilityMerge";
import { useCredibilitySourceCheck } from "./credibility/useCredibilitySourceCheck";

export const useCredibilitySection = (candidateId: string | null) => {
  const {
    value,
    setValue,
    isSubmitted,
    setIsSubmitted,
    isEditing,
    setIsEditing,
    isLoading: stateLoading
  } = useCredibilityState(candidateId);

  const { handleSubmit, handleReset } = useCredibilitySubmission(
    candidateId,
    setIsSubmitted,
    setIsEditing,
    setValue
  );

  const {
    isMerging,
    mergeResult,
    handleMerge
  } = useCredibilityMerge(candidateId, setValue, setIsEditing);

  const {
    hasResume,
    hasLinkedIn,
    hasScreening,
    isLoading: sourceCheckLoading
  } = useCredibilitySourceCheck(candidateId);

  return {
    value,
    setValue,
    isSubmitted,
    isEditing,
    setIsEditing,
    isLoading: stateLoading || sourceCheckLoading,
    isMerging,
    hasResume,
    hasLinkedIn,
    hasScreening,
    handleSubmit,
    handleReset,
    handleMerge,
    mergeResult,
  };
};