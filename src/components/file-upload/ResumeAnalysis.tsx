import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnalysisSection } from "./analysis/AnalysisSection";
import { useAnalysisState } from "./analysis/useAnalysisState";

const ANALYSIS_SECTIONS = [
  { key: 'credibilityStatements', title: 'Credibility Statements' },
  { key: 'caseStudies', title: 'Case Studies' },
  { key: 'jobAssessment', title: 'Complete Assessment of Job' },
  { key: 'motivations', title: 'Motivations' },
  { key: 'businessProblems', title: 'Business Problems They Solve Better Than Most' },
  { key: 'additionalObservations', title: 'Additional Observations' },
];

export const ResumeAnalysis = () => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

  const { data: executiveSummary, isLoading } = useQuery({
    queryKey: ['executiveSummary', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("Fetching executive summary for resume analysis:", candidateId);
      const { data, error } = await supabase
        .from('executive_summaries')
        .select('brass_tax_criteria')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching executive summary:", error);
        throw error;
      }

      console.log("Fetched executive summary:", data);
      return data;
    },
    enabled: !!candidateId,
  });

  const analysis = executiveSummary?.brass_tax_criteria;
  const {
    editingSection,
    editedContent,
    handleEdit,
    handleSave,
    setEditedContent
  } = useAnalysisState(candidateId, analysis);

  if (!analysis && !isLoading) return null;

  const hasContent = analysis && Object.values(analysis).some(value => value && value !== "No data found");

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              {hasContent && <CheckCircle className="h-4 w-4 text-green-500" />}
              Resume Job Matching Criteria
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading analysis...</p>
              ) : (
                ANALYSIS_SECTIONS.map(({ key, title }) => (
                  <AnalysisSection
                    key={key}
                    title={title}
                    content={analysis[key] || ""}
                    isEditing={editingSection === key}
                    editedContent={editedContent}
                    onEdit={() => handleEdit(key, analysis[key] || "")}
                    onSave={() => handleSave(key)}
                    onContentChange={setEditedContent}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};