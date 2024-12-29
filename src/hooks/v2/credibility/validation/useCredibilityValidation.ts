import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCredibilityValidation = (candidateId: string | null) => {
  // Always initialize toast hook at the top level
  const { toast } = useToast();

  console.log("Initializing credibility validation hook for candidate:", candidateId);

  const validateCandidate = () => {
    if (!candidateId) {
      console.error("Operation attempted without candidate ID");
      toast({
        title: "Error",
        description: "No candidate selected. Please select a candidate first.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateSourcesForMerge = async (): Promise<boolean> => {
    if (!validateCandidate()) return false;

    try {
      console.log("Validating sources for merge operation");
      
      const [resumeResponse, linkedInResponse] = await Promise.all([
        supabase
          .from('resume_analyses')
          .select('credibility_statements')
          .eq('candidate_id', candidateId)
          .maybeSingle(),
        supabase
          .from('linkedin_sections')
          .select('analysis')
          .eq('candidate_id', candidateId)
          .eq('section_type', 'about')
          .maybeSingle()
      ]);

      const hasResume = !!resumeResponse.data?.credibility_statements;
      const hasLinkedIn = !!linkedInResponse.data?.analysis;

      console.log("Source validation results:", { hasResume, hasLinkedIn });

      if (!hasResume && !hasLinkedIn) {
        toast({
          title: "Missing Data",
          description: "Please upload either a resume or LinkedIn data before merging.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating sources:", error);
      toast({
        title: "Validation Error",
        description: "Failed to validate data sources. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    validateCandidate,
    validateSourcesForMerge,
  };
};