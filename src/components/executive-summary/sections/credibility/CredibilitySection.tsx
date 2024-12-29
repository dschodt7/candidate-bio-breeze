import { useState, useEffect } from "react";
import { CredibilityHeader } from "./CredibilityHeader";
import { CredibilityContent } from "./CredibilityContent";
import { useCredibilitySourceCheck } from "@/hooks/useCredibilitySourceCheck";
import { useCredibilityState } from "./useCredibilityState";
import { Skeleton } from "@/components/ui/skeleton";

interface CredibilitySectionProps {
  candidateId: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const CredibilitySection = ({ 
  candidateId,
  onChange,
  onSubmit
}: CredibilitySectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    isSubmitted,
    mergeResult,
    isMerging,
    value,
    setValue,
    handleSubmit,
    handleReset,
    handleMerge
  } = useCredibilityState(candidateId);

  const {
    hasResume,
    hasLinkedIn,
    hasScreening,
    isLoading
  } = useCredibilitySourceCheck(candidateId);

  useEffect(() => {
    console.log("CredibilitySection mounted/updated");
    console.log("Current submission state:", isSubmitted);
    console.log("Current merge result:", mergeResult);
    
    return () => {
      console.log("CredibilitySection unmounting");
    };
  }, [isSubmitted, mergeResult]);

  const handleMergeClick = async () => {
    console.log("Initiating merge operation");
    const result = await handleMerge();
    console.log("Merge operation result:", result);
    if (result) {
      onChange(result.mergedStatements.join("\n\n"));
    }
  };

  const handleSubmitClick = async () => {
    console.log("Submitting credibility with value:", value);
    const success = await handleSubmit(value);
    console.log("Submission result:", success);
    if (success) {
      setIsEditing(false);
      onSubmit();
    }
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange(newValue);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-[200px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CredibilityHeader
        onMerge={handleMergeClick}
        isMerging={isMerging}
        hasResume={hasResume}
        hasLinkedIn={hasLinkedIn}
        hasScreening={hasScreening}
      />
      <CredibilityContent
        value={value}
        mergeResult={mergeResult}
        isSubmitted={isSubmitted}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSubmit={handleSubmitClick}
        onReset={handleReset}
        onChange={handleChange}
      />
    </div>
  );
};