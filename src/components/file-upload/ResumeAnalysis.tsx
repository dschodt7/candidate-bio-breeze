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
  { key: 'credibility_statements', title: 'Credibility Statements' },
  { key: 'case_studies', title: 'Case Studies' },
  { key: 'job_assessment', title: 'Complete Assessment of Job' },
  { key: 'motivations', title: 'Motivations' },
  { key: 'business_problems', title: 'Business Problems They Solve Better Than Most' },
  { key: 'additional_observations', title: 'Additional Observations' },
];

export const ResumeAnalysis = () => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['resumeAnalysis', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("Fetching resume analysis for candidate:", candidateId);
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching resume analysis:", error);
        throw error;
      }

      console.log("Fetched resume analysis:", data);
      return data;
    },
    enabled: !!candidateId,
  });

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
                    content={analysis?.[key] || ""}
                    isEditing={editingSection === key}
                    editedContent={editedContent}
                    onEdit={() => handleEdit(key, analysis?.[key] || "")}
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