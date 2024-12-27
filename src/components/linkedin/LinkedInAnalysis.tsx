import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnalysisSection } from "../file-upload/analysis/AnalysisSection";
import { useAnalysisState } from "../file-upload/analysis/useAnalysisState";

const ANALYSIS_SECTIONS = [
  { key: 'credibilityStatements', title: 'Credibility Statements' },
  { key: 'caseStudies', title: 'Case Studies' },
  { key: 'jobAssessment', title: 'Complete Assessment of Job' },
  { key: 'motivations', title: 'Motivations' },
  { key: 'businessProblems', title: 'Business Problems They Solve Better Than Most' },
  { key: 'interests', title: 'Interests' },
  { key: 'activities', title: 'Activities and Hobbies' },
  { key: 'foundationalUnderstanding', title: 'Foundational Understanding on a Personal Level' },
];

export const LinkedInAnalysis = () => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

  const { data: linkedInSections, isLoading: isSectionsLoading } = useQuery({
    queryKey: ['linkedInSections', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('content, section_type')
        .eq('candidate_id', candidateId);

      if (error) throw error;
      return data;
    },
    enabled: !!candidateId,
  });

  const { data: analysis, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['linkedInAnalysis', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('analysis')
        .eq('candidate_id', candidateId)
        .eq('section_type', 'about')
        .maybeSingle();

      if (error) throw error;
      return data?.analysis;
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

  const handleAnalyze = async () => {
    if (!candidateId || !linkedInSections?.length) return;

    try {
      console.log("Starting LinkedIn sections analysis");
      const { data, error } = await supabase.functions.invoke('analyze-linkedin-sections', {
        body: { 
          candidateId,
          sections: linkedInSections
        }
      });

      if (error) throw error;
      console.log("LinkedIn analysis completed:", data);
    } catch (error) {
      console.error("Error analyzing LinkedIn sections:", error);
    }
  };

  const hasContent = analysis && Object.values(analysis).some(value => value && value !== "No data found");
  const hasSections = linkedInSections && linkedInSections.length > 0;

  return (
    <div className="mt-4">
      {!hasContent && (
        <Button 
          onClick={handleAnalyze} 
          disabled={!hasSections || isAnalysisLoading}
          className="w-full mb-4"
        >
          Analyze LinkedIn Sections
        </Button>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              {hasContent && <CheckCircle className="h-4 w-4 text-green-500" />}
              LinkedIn Job Matching Criteria
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {isSectionsLoading || isAnalysisLoading ? (
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