import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

export const useResultsAchievementsSection = (candidateId: string | null) => {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);

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
            .select('results_achievements')
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

        if (summaryResponse.error) {
          console.error("Error fetching results summary:", summaryResponse.error);
          toast({
            title: "Error Loading Data",
            description: "Failed to load results data. Please try again.",
            variant: "destructive",
          });
          throw summaryResponse.error;
        }
        
        if (summaryResponse.data) {
          console.log("Found existing results summary:", summaryResponse.data);
          setValue(summaryResponse.data.results_achievements || "");
          setIsSubmitted(!!summaryResponse.data.results_achievements);
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
        toast({
          title: "Error",
          description: "Failed to load results section. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialState();
  }, [candidateId, toast]);

  const handleSubmit = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[ResultsAchievementsSection] Submitting results achievement to database for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          results_achievements: value,
          results_submitted: true
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("[ResultsAchievementsSection] Results achievement submitted successfully");
      setIsSubmitted(true);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Results and achievements saved successfully",
      });
    } catch (error) {
      console.error("[ResultsAchievementsSection] Error submitting results achievement:", error);
      toast({
        title: "Error",
        description: "Failed to save results and achievements",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Resetting results achievement in database for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          results_achievements: "",
          resume_results_source: null,
          linkedin_results_source: null
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("Results achievement reset successfully");
      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
      setMergeResult(null);
      toast({
        title: "Success",
        description: "Results and achievements have been reset",
      });
    } catch (error) {
      console.error("Error resetting results achievement:", error);
      toast({
        title: "Error",
        description: "Failed to reset results and achievements",
        variant: "destructive",
      });
    }
  };

  const handleMerge = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    setIsMerging(true);
    try {
      console.log("Starting merge operation for results achievements, candidate:", candidateId);
      const { data, error } = await supabase.functions.invoke('merge-results-achievements', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("Received merge response for results:", data);

      if (data?.data?.mergedStatements) {
        const result = data.data as MergeResult;
        setMergeResult(result);
        setValue(result.mergedStatements.join("\n\n"));
        setIsEditing(true);
        
        toast({
          title: "Success",
          description: "Results and achievements merged successfully",
        });
      } else {
        throw new Error("No merged statements received");
      }
    } catch (error) {
      console.error("Error merging results achievements:", error);
      toast({
        title: "Merge Failed",
        description: "Failed to merge results and achievements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

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