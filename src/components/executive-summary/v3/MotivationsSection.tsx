import { MOTIVATIONS_SECTION } from "@/config/executive-summary-sections";
import { BaseSectionWrapper } from "../base/BaseSectionWrapper";
import { BaseSectionContent } from "../base/BaseSectionContent";
import { useMotivationsSection } from "@/hooks/v2/motivations/useMotivationsSection";

export const MotivationsSection = ({ candidateId }: { candidateId: string | null }) => {
  const {
    value,
    isSubmitted,
    isEditing,
    isLoading,
    isMerging,
    executiveSummary,
    hasResume,
    hasLinkedIn,
    hasScreening,
    setValue,
    setIsEditing,
    handleSubmit,
    handleMerge,
    handleReset,
  } = useMotivationsSection(candidateId);

  console.log("[MotivationsSection] Rendering with:", {
    hasValue: !!value,
    isSubmitted,
    isEditing,
    isLoading,
    isMerging,
    hasExecutiveSummary: !!executiveSummary
  });

  const sourceAvailability = {
    hasResume,
    hasLinkedIn,
    hasScreening,
  };

  return (
    <BaseSectionWrapper
      config={MOTIVATIONS_SECTION}
      sourceAvailability={sourceAvailability}
      isSubmitted={isSubmitted}
    >
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
    </BaseSectionWrapper>
  );
};