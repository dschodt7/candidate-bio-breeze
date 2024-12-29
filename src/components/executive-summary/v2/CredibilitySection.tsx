import { useSearchParams } from "react-router-dom";
import { ExecutiveSummarySection } from "./ExecutiveSummarySection";
import { CredibilityContent } from "./CredibilityContent";
import { useCredibilitySection } from "@/hooks/v2/useCredibilitySection";

export const CredibilitySection = () => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  
  const {
    value,
    setValue,
    isSubmitted,
    isEditing,
    setIsEditing,
    isLoading,
    hasResume,
    hasLinkedIn,
    hasScreening,
    handleSubmit,
    handleReset,
  } = useCredibilitySection(candidateId);

  return (
    <ExecutiveSummarySection
      title="Credibility Statements"
      helpText="Highlight achievements and qualifications that validate the candidate's expertise. Use data-driven examples or significant milestones."
      sectionKey="credibility"
      hasResume={hasResume}
      hasLinkedIn={hasLinkedIn}
      hasScreening={hasScreening}
    >
      <CredibilityContent
        value={value}
        isSubmitted={isSubmitted}
        isEditing={isEditing}
        isLoading={isLoading}
        onChange={setValue}
        onSubmit={handleSubmit}
        onEdit={() => setIsEditing(true)}
        onReset={handleReset}
      />
    </ExecutiveSummarySection>
  );
};