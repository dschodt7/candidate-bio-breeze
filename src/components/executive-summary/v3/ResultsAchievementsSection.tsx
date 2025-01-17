import { useResultsAchievementsSection } from "@/hooks/v2/results/useResultsAchievementsSection";
import { BaseSectionWrapper } from "../base/BaseSectionWrapper";
import { BaseSectionContent } from "../base/BaseSectionContent";
import { SourceAnalysis } from "../sections/credibility/SourceAnalysis";
import { RESULTS_SECTION } from "@/config/executive-summary-sections";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface ResultsAchievementsSectionProps {
  candidateId: string | null;
}

export const ResultsAchievementsSection = ({ candidateId }: ResultsAchievementsSectionProps) => {
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
  } = useResultsAchievementsSection(candidateId);

  console.log("ResultsAchievementsSection rendering with:", {
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
        config={RESULTS_SECTION}
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