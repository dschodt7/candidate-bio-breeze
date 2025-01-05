import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { BaseSectionWrapper } from "@/components/executive-summary/base/BaseSectionWrapper";
import { BaseSectionContent } from "@/components/executive-summary/base/BaseSectionContent";
import { useScreeningAnalysis } from "./hooks/useScreeningAnalysis";
import { ScreeningAnalysisSection, ScreeningAnalysisProps } from "./types/screening-analysis";

const ANALYSIS_SECTIONS: ScreeningAnalysisSection[] = [
  {
    key: "compensation_expectations",
    title: "Compensation Expectations",
    helpText: "Candidate's salary requirements and compensation expectations",
  },
  {
    key: "work_arrangements",
    title: "Work Arrangements",
    helpText: "Preferred working arrangements, including remote/hybrid preferences",
  },
  {
    key: "availability_timeline",
    title: "Availability Timeline",
    helpText: "Expected start date and notice period details",
  },
  {
    key: "current_challenges",
    title: "Current Challenges",
    helpText: "Key challenges in current role and desired changes",
  },
  {
    key: "executive_summary_notes",
    title: "Executive Summary Notes",
    helpText: "Key insights and observations from the screening discussion",
  },
];

export const ScreeningAnalysis = ({ 
  notes, 
  isNotesSubmitted, 
  candidateId 
}: ScreeningAnalysisProps) => {
  const {
    analysis,
    isLoadingAnalysis,
    isAnalyzing,
    editingSection,
    setEditingSection,
    analyzeNotes,
    updateSection,
  } = useScreeningAnalysis(candidateId);

  // Don't show anything if notes aren't submitted
  if (!isNotesSubmitted) return null;

  return (
    <div className="space-y-4 mt-4">
      <Button
        onClick={() => analyzeNotes(notes)}
        disabled={isAnalyzing || !notes.trim()}
        className="w-full relative group"
      >
        <span className="flex items-center justify-center gap-2">
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
              <span className="group-hover:scale-105 transition-transform">
                Analyze Screening Notes
              </span>
            </>
          )}
        </span>
      </Button>

      {ANALYSIS_SECTIONS.map((section) => (
        <BaseSectionWrapper
          key={section.key}
          config={{
            key: section.key,
            title: section.title,
            helpText: section.helpText,
          }}
          sourceAvailability={{
            hasResume: false,
            hasLinkedIn: false,
            hasScreening: true,
          }}
        >
          <BaseSectionContent
            value={analysis?.[section.key] || ""}
            isSubmitted={!!analysis?.[section.key]}
            isEditing={editingSection === section.key}
            isLoading={isLoadingAnalysis}
            onChange={(value) => {
              if (analysis) {
                updateSection(section.key, value);
              }
            }}
            onSubmit={() => {
              if (analysis?.[section.key]) {
                setEditingSection(null);
              }
            }}
            onEdit={() => setEditingSection(section.key)}
            onReset={() => updateSection(section.key, "")}
          />
        </BaseSectionWrapper>
      ))}
    </div>
  );
};