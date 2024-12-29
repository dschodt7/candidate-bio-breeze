import { useCredibilitySection } from "@/hooks/v2/useCredibilitySection";
import { ExecutiveSummarySection } from "./ExecutiveSummarySection";
import { CredibilityContent } from "./CredibilityContent";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";

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
    handleSubmit,
    handleReset,
    handleMerge,
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
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={handleMerge}
          disabled={isMerging || !hasResume}
          className="gap-2 w-full group relative"
        >
          {isMerging ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
          )}
          <span className={isMerging ? "" : "group-hover:scale-105 transition-transform"}>
            AI Compile
          </span>
        </Button>
        
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
      </div>
    </ExecutiveSummarySection>
  );
};