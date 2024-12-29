import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCredibilityState = (candidateId: string | null) => {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Source availability state
  const [hasResume, setHasResume] = useState(false);
  const [hasLinkedIn, setHasLinkedIn] = useState(false);
  const [hasScreening, setHasScreening] = useState(false);

  useEffect(() => {
    const fetchInitialState = async () => {
      if (!candidateId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching initial state for candidate:", candidateId);
        setIsLoading(true);

        const [summaryResponse, resumeResponse, linkedInResponse] = await Promise.all([
          supabase
            .from('executive_summaries')
            .select('credibility_statement, credibility_submitted')
            .eq('candidate_id', candidateId)
            .maybeSingle(),
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

        if (summaryResponse.error) throw summaryResponse.error;
        
        // Set core state
        if (summaryResponse.data) {
          console.log("Found existing summary:", summaryResponse.data);
          setValue(summaryResponse.data.credibility_statement || "");
          setIsSubmitted(summaryResponse.data.credibility_submitted || false);
        }

        // Set source availability
        setHasResume(!!resumeResponse.data?.credibility_statements);
        setHasLinkedIn(!!linkedInResponse.data?.analysis);
        setHasScreening(false); // For future implementation

        console.log("Source availability:", {
          resume: !!resumeResponse.data?.credibility_statements,
          linkedin: !!linkedInResponse.data?.analysis,
          screening: false
        });

      } catch (error) {
        console.error("Error fetching initial state:", error);
        toast({
          title: "Error",
          description: "Failed to load credibility section",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialState();
  }, [candidateId, toast]);

  return {
    value,
    setValue,
    isSubmitted,
    setIsSubmitted,
    isEditing,
    setIsEditing,
    isLoading,
    hasResume,
    hasLinkedIn,
    hasScreening,
  };
};