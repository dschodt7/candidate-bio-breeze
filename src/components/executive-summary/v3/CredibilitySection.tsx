import { useCredibilitySection } from "@/hooks/v2/useCredibilitySection";
import { BaseSectionWrapper } from "../base/BaseSectionWrapper";
import { BaseSectionContent } from "../base/BaseSectionContent";
import { SourceAnalysis } from "../sections/credibility/SourceAnalysis";
import { CREDIBILITY_SECTION } from "@/config/executive-summary-sections";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface CredibilitySectionProps {
  candidateId: string | null;
}

export const CredibilitySection = ({ candidateId }: CredibilitySectionProps) => {
  const {
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
    handleSubmit,
    handleReset,
    handleMerge
  } = useCredibilitySection(candidateId);

  console.log("CredibilitySection v3 rendering with:", {
    value,
    isSubmitted,
    isEditing,
    isLoading,
    isMerging,
    hasResume,
    hasLinkedIn,
    hasScreening
  });

  return (
    <ErrorBoundary>
      <BaseSectionWrapper
        config={CREDIBILITY_SECTION}
        sourceAvailability={{ hasResume, hasLinkedIn, hasScreening }}
        isSubmitted={isSubmitted}
      >
        <div className="space-y-4">
          <BaseSectionContent
            value={value}
            isSubmitted={isSubmitted}
            isEditing={isEditing}
            isLoading={isLoading}
            isMerging={isMerging}
            showAICompile={true}
            onChange={setValue}
            onSubmit={handleSubmit}
            onEdit={() => setIsEditing(true)}
            onReset={handleReset}
            onMerge={handleMerge}
          />
          <SourceAnalysis mergeResult={mergeResult} />
        </div>
      </BaseSectionWrapper>
    </ErrorBoundary>
  );
};