import { useCaseStudiesSection } from "@/hooks/v2/case-studies/useCaseStudiesSection";
import { BaseSectionWrapper } from "../base/BaseSectionWrapper";
import { BaseSectionContent } from "../base/BaseSectionContent";
import { SourceAnalysis } from "../sections/credibility/SourceAnalysis";
import { CASE_STUDIES_SECTION } from "@/config/executive-summary-sections";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface CaseStudiesSectionProps {
  candidateId: string | null;
}

export const CaseStudiesSection = ({ candidateId }: CaseStudiesSectionProps) => {
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
  } = useCaseStudiesSection(candidateId);

  console.log("CaseStudiesSection rendering with:", {
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
        config={CASE_STUDIES_SECTION}
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