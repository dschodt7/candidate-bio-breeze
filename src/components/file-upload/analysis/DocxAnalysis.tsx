import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnalysisSection } from "./AnalysisSection";
import { useAnalysisState } from "./useAnalysisState";
import { Skeleton } from "@/components/ui/skeleton";

const ANALYSIS_SECTIONS = [
  { key: 'job_assessment', title: 'Assessment of Current Skills and Experiences' },
  { key: 'case_studies', title: 'Case Studies' },
  { key: 'credibility_statements', title: 'Results and Achievements' },
  { key: 'motivations', title: 'Motivations' },
  { key: 'business_problems', title: 'Business Problems They Solve Better Than Most' },
  { key: 'additional_observations', title: 'Additional Observations' },
];

interface DocxAnalysisProps {
  analysisCompleted: boolean;
}

export const DocxAnalysis = ({ analysisCompleted }: DocxAnalysisProps) => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['resumeAnalysis', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("[DocxAnalysis] Fetching analysis for candidate:", candidateId);
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("[DocxAnalysis] Error fetching analysis:", error);
        throw error;
      }

      console.log("[DocxAnalysis] Database query result:", {
        hasData: !!data,
        sections: data ? Object.keys(data) : [],
        firstSection: data?.credibility_statements?.substring(0, 100)
      });
      return data;
    },
    enabled: !!candidateId && analysisCompleted,
    staleTime: 0,
  });

  const {
    editingSection,
    editedContent,
    handleEdit,
    handleSave,
    setEditedContent
  } = useAnalysisState(candidateId, analysis);

  const hasValidContent = (analysis: any) => {
    return analysis && Object.values(analysis).some(value => 
      value && 
      typeof value === 'string' && 
      value.trim() !== "" && 
      value !== "No data found"
    );
  };

  console.log("[DocxAnalysis] Component state:", {
    hasAnalysis: !!analysis,
    isLoading,
    error,
    candidateId,
    hasValidContent: hasValidContent(analysis),
    analysisCompleted
  });

  // Don't show anything if analysis hasn't been initiated
  if (!analysisCompleted) {
    console.log("[DocxAnalysis] Analysis not yet completed");
    return null;
  }

  if (error) {
    console.error("[DocxAnalysis] Error in component:", error);
    return <div className="text-sm text-red-500">Error loading analysis</div>;
  }

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                hasValidContent(analysis) && <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              Resume: Leader Discovery Criteria
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {isLoading ? (
                <div className="space-y-4">
                  {ANALYSIS_SECTIONS.map(({ title }) => (
                    <div key={title} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                hasValidContent(analysis) && ANALYSIS_SECTIONS.map(({ key, title }) => (
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
              {!isLoading && !hasValidContent(analysis) && (
                <div className="flex items-center justify-center py-4">
                  <span className="text-sm text-muted-foreground">
                    Click "Analyze Resume" to generate insights
                  </span>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};