import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useResultsState } from "./useResultsState";
import { useResultsDatabase } from "./useResultsDatabase";
import { useResultsMerge } from "./useResultsMerge";

export const useResultsAchievementsSection = (candidateId: string | null) => {
  const {
    value,
    setValue,
    isSubmitted,
    setIsSubmitted,
    isEditing,
    setIsEditing,
    isLoading,
    setIsLoading,
    isMerging,
    setIsMerging,
  } = useResultsState();

  const {
    mergeResult,
    setMergeResult,
    handleSubmit: submitToDatabase,
    handleReset: resetInDatabase,
  } = useResultsDatabase(candidateId);

  const { handleMerge } = useResultsMerge(
    candidateId,
    setValue,
    setIsEditing,
    setIsMerging,
    setMergeResult
  );

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
        console.log("Fetching initial results state for candidate:", candidateId);
        setIsLoading(true);

        const [summaryResponse, resumeResponse, linkedInResponse] = await Promise.all([
          supabase
            .from('executive_summaries')
            .select('results_achievements, results_submitted')
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
        
        if (summaryResponse.data) {
          console.log("Found existing results summary:", summaryResponse.data);
          setValue(summaryResponse.data.results_achievements || "");
          setIsSubmitted(!!summaryResponse.data.results_submitted);
        }

        setHasResume(!!resumeResponse.data?.credibility_statements);
        setHasLinkedIn(!!linkedInResponse.data?.analysis);
        setHasScreening(false);

        console.log("Results source availability:", {
          resume: !!resumeResponse.data?.credibility_statements,
          linkedin: !!linkedInResponse.data?.analysis,
          screening: false
        });

      } catch (error) {
        console.error("Error fetching initial results state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialState();
  }, [candidateId]);

  const handleSubmit = () => submitToDatabase(value, setIsSubmitted, setIsEditing);
  const handleReset = () => resetInDatabase(setValue, setIsSubmitted, setIsEditing, setMergeResult);

  return {
    value,
    setValue,
    isSubmitted,
    isEditing,
    setIsEditing,
    isLoading,
    isMerging,
    hasResume,
    hasLinkedIn,
    hasScreening,
    mergeResult,
    handleSubmit,
    handleReset,
    handleMerge,
  };
};