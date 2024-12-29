import { useCredibilityState } from "./credibility/useCredibilityState";
import { useCredibilityOperations } from "./credibility/useCredibilityOperations";

export const useCredibilitySection = (candidateId: string | null) => {
  const {
    value,
    setValue,
    isSubmitted,
    setIsSubmitted,
    isEditing,
    setIsEditing,
    isLoading,
    hasResume,
    hasLinkedIn,
    hasScreening,
  } = useCredibilityState(candidateId);

  const {
    isMerging,
    mergeResult,
    handleSubmit,
    handleReset,
    handleMerge,
  } = useCredibilityOperations(
    candidateId,
    value,
    setIsSubmitted,
    setIsEditing,
    setValue
  );

  return {
    // State
    value,
    setValue,
    isSubmitted,
    isEditing,
    setIsEditing,
    isLoading,
    isMerging,
    hasResume,
    hasLinkedIn,
    hasScreening,
    mergeResult,
    
    // Operations
    handleSubmit,
    handleReset,
    handleMerge,
  };
};