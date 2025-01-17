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
import { AnalyzeButton } from "./analysis/AnalyzeButton";
import { AnalysisSectionsList } from "./analysis/AnalysisSectionsList";

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
      console.log("Fetching LinkedIn analysis for candidate:", candidateId);
      
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('analysis')
        .eq('candidate_id', candidateId)
        .eq('section_type', 'about')
        .maybeSingle();

      if (error) {
        console.error("Error fetching LinkedIn analysis:", error);
        throw error;
      }

      console.log("LinkedIn analysis data:", data);
      return data?.analysis;
    },
    enabled: !!candidateId,
  });

  const hasContent = analysis && Object.values(analysis).some(value => value && value !== "No data found");

  return (
    <div className="mt-4">
      <AnalyzeButton
        candidateId={candidateId}
        linkedInSections={linkedInSections}
        isLoading={isAnalysisLoading}
      />

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="analysis">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              {hasContent && <CheckCircle className="h-4 w-4 text-green-500" />}
              LinkedIn: Analysis Results
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AnalysisSectionsList
              candidateId={candidateId}
              analysis={analysis}
              isLoading={isSectionsLoading || isAnalysisLoading}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};