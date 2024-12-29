import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCredibilitySourceCheck = (candidateId: string | null) => {
  const { toast } = useToast();
  const [hasResume, setHasResume] = useState(false);
  const [hasLinkedIn, setHasLinkedIn] = useState(false);
  const [hasScreening, setHasScreening] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSources = async () => {
      if (!candidateId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Checking sources for candidate:", candidateId);
        setIsLoading(true);
        
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
        
        setHasResume(!!resumeResponse.data?.credibility_statements);
        setHasLinkedIn(!!linkedInResponse.data?.analysis);
        setHasScreening(false); // For future implementation

        console.log("Source check completed:", {
          resume: !!resumeResponse.data?.credibility_statements,
          linkedin: !!linkedInResponse.data?.analysis
        });
      } catch (error) {
        console.error("Error checking sources:", error);
        toast({
          title: "Error",
          description: "Failed to check source availability",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSources();
  }, [candidateId, toast]);

  return {
    hasResume,
    hasLinkedIn,
    hasScreening,
    isLoading,
  };
};