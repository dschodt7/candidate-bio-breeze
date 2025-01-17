import { Button } from "@/components/ui/button";
import { Loader2, Wand2, CheckCircle, Pencil, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
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

const EditButton = ({
  isEditing,
  onEdit,
  onSave,
}: {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={isEditing ? onSave : onEdit}
    className="h-8 px-2"
  >
    {isEditing ? (
      <Check className="h-4 w-4" />
    ) : (
      <Pencil className="h-4 w-4" />
    )}
  </Button>
);

const AnalysisSectionsList = ({
  analysis,
  isLoading,
  editingSection,
  setEditingSection,
  updateSection,
}: {
  analysis: any;
  isLoading: boolean;
  editingSection: string | null;
  setEditingSection: (section: string | null) => void;
  updateSection: (key: string, content: string) => Promise<void>;
}) => {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading analysis...</p>;
  }

  return (
    <div className="space-y-4 pt-2">
      {ANALYSIS_SECTIONS.map((section) => (
        <div key={section.key} className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              {section.title}
            </h4>
            <EditButton
              isEditing={editingSection === section.key}
              onEdit={() => setEditingSection(section.key)}
              onSave={() => setEditingSection(null)}
            />
          </div>
          {editingSection === section.key ? (
            <Textarea
              value={analysis?.[section.key] || ''}
              onChange={(e) => updateSection(section.key, e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {analysis?.[section.key] || "No data found"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

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

  if (!isNotesSubmitted) return null;

  const hasContent = analysis && Object.values(analysis).some(value => value && value !== "");

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

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-lg font-medium">
            <div className="flex items-center gap-2">
              {hasContent && <CheckCircle className="h-4 w-4 text-green-500" />}
              Discovery Screening: Analysis Results
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AnalysisSectionsList
              analysis={analysis}
              isLoading={isLoadingAnalysis}
              editingSection={editingSection}
              setEditingSection={setEditingSection}
              updateSection={updateSection}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};