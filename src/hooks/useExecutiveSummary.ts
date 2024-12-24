import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExecutiveSummary = (candidateId: string | undefined) => {
  const { data: executiveSummary } = useQuery({
    queryKey: ['executiveSummary', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("Fetching executive summary for candidate:", candidateId);
      const { data, error } = await supabase
        .from('executive_summaries')
        .select('*')
        .eq('candidate_id', candidateId)
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

  const brassTaxCount = executiveSummary?.brass_tax_criteria ? 
    Object.values(executiveSummary.brass_tax_criteria).filter(value => value).length : 0;
  const sensoryCount = executiveSummary?.sensory_criteria ? 
    Object.values(executiveSummary.sensory_criteria).filter(value => value).length : 0;

  return {
    executiveSummary,
    brassTaxCount,
    sensoryCount,
  };
};