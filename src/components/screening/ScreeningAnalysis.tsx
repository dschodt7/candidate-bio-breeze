import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisSection } from "./AnalysisSection";
import { Skeleton } from "@/components/ui/skeleton";
import { ScreeningAnalysisData } from "./types/screening-analysis";

interface ScreeningAnalysisProps {
  notes: string;
  isNotesSubmitted: boolean;
  candidateId: string;
}

export const ScreeningAnalysis = ({ notes, isNotesSubmitted, candidateId }: ScreeningAnalysisProps) => {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['screeningAnalysis', candidateId],
    queryFn: async () => {
      console.log("Fetching screening analysis for candidate:", candidateId);
      const { data, error } = await supabase
        .from('screening_analyses')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching screening analysis:", error);
        throw error;
      }

      console.log("Fetched screening analysis:", data);
      return data as ScreeningAnalysisData;
    },
    enabled: !!candidateId && isNotesSubmitted,
  });

  if (!isNotesSubmitted) return null;

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-lg font-semibold">Analysis</h3>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : analysis ? (
        <>
          <AnalysisSection
            title="Compensation Expectations"
            content={analysis.compensation_expectations}
          />
          <AnalysisSection
            title="Work Arrangements"
            content={analysis.work_arrangements}
          />
          <AnalysisSection
            title="Availability Timeline"
            content={analysis.availability_timeline}
          />
          <AnalysisSection
            title="Current Challenges"
            content={analysis.current_challenges}
          />
          <AnalysisSection
            title="Executive Summary Notes"
            content={analysis.executive_summary_notes}
          />
        </>
      ) : (
        <div className="text-sm text-muted-foreground">
          No analysis available. Click "Analyze Notes" to generate insights.
        </div>
      )}
    </div>
  );
};