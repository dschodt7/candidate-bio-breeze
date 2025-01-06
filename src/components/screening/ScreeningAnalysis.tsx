import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle } from "lucide-react";
import { AnalyzeButton } from "./analysis/AnalyzeButton";
import { AnalysisSectionsList } from "./analysis/AnalysisSectionsList";
import { useScreeningAnalysis } from "./hooks/useScreeningAnalysis";
import { ScreeningAnalysisProps } from "./types/screening-analysis";

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

  // Check if any section has content
  const hasContent = analysis && Object.values(analysis).some(value => 
    value && 
    typeof value === 'string' && 
    value.trim() !== "" && 
    value !== "No data found"
  );

  console.log("[ScreeningAnalysis] Rendering with:", {
    hasContent,
    isLoadingAnalysis,
    isAnalyzing,
    editingSection,
    analysisKeys: analysis ? Object.keys(analysis) : []
  });

  return (
    <div className="space-y-4 mt-4">
      <AnalyzeButton
        onAnalyze={() => analyzeNotes(notes)}
        isAnalyzing={isAnalyzing}
        isDisabled={isLoadingAnalysis || isAnalyzing || !notes.trim()}
      />

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              {hasContent && <CheckCircle className="h-4 w-4 text-green-500" />}
              Screening: Leader Discovery Criteria
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AnalysisSectionsList
              analysis={analysis}
              isLoading={isLoadingAnalysis}
              editingSection={editingSection}
              setEditingSection={setEditingSection}
              onUpdateSection={updateSection}
              hasContent={hasContent}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};