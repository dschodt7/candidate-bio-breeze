import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

export const useCredibilityState = (candidateId: string | null) => {
  const { toast } = useToast();
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [hasLinkedIn, setHasLinkedIn] = useState(false);
  const [hasScreening, setHasScreening] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
        
        // Check for resume analysis
        const { data: resumeAnalysis } = await supabase
          .from('resume_analyses')
          .select('credibility_statements')
          .eq('candidate_id', candidateId)
          .maybeSingle();
        
        const resumeAvailable = !!resumeAnalysis?.credibility_statements;
        console.log("Resume analysis available:", resumeAvailable);
        setHasResume(resumeAvailable);

        // Check for LinkedIn analysis
        const { data: linkedInSection } = await supabase
          .from('linkedin_sections')
          .select('analysis')
          .eq('candidate_id', candidateId)
          .eq('section_type', 'about')
          .maybeSingle();
        
        const linkedInAvailable = !!linkedInSection?.analysis;
        console.log("LinkedIn analysis available:", linkedInAvailable);
        setHasLinkedIn(linkedInAvailable);

        // Check submission state
        const { data: executiveSummary } = await supabase
          .from('executive_summaries')
          .select('credibility_submitted')
          .eq('candidate_id', candidateId)
          .maybeSingle();

        const submitted = !!executiveSummary?.credibility_submitted;
        console.log("Credibility submitted state:", submitted);
        setIsSubmitted(submitted);

        // For now, screening is always false since we haven't implemented it
        setHasScreening(false);

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
    mergeResult,
    setMergeResult,
    isMerging,
    setIsMerging,
    hasResume,
    hasLinkedIn,
    hasScreening,
    isSubmitted,
    setIsSubmitted,
    isLoading,
  };
};