import { useBusinessProblemsSection } from "@/hooks/v2/business-problems/useBusinessProblemsSection";
import { BaseSectionWrapper } from "../base/BaseSectionWrapper";
import { BaseSectionContent } from "../base/BaseSectionContent";
import { SourceAnalysis } from "../sections/credibility/SourceAnalysis";
import { BUSINESS_PROBLEMS_SECTION } from "@/config/executive-summary-sections";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface BusinessProblemsSectionProps {
  candidateId: string | null;
}

export const BusinessProblemsSection = ({ candidateId }: BusinessProblemsSectionProps) => {
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
  } = useBusinessProblemsSection(candidateId);

  console.log("BusinessProblemsSection rendering with:", {
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
        config={BUSINESS_PROBLEMS_SECTION}
        sourceAvailability={{ hasResume, hasLinkedIn, hasScreening }}
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