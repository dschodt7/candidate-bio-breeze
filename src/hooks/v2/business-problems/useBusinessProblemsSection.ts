import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

export const useBusinessProblemsSection = (candidateId: string | null) => {
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
        console.log("Fetching initial business problems state for candidate:", candidateId);
        setIsLoading(true);

        const [summaryResponse, resumeResponse, linkedInResponse] = await Promise.all([
          supabase
            .from('executive_summaries')
            .select('business_problems')
            .eq('candidate_id', candidateId)
            .maybeSingle(),
          supabase
            .from('resume_analyses')
            .select('business_problems')
            .eq('candidate_id', candidateId)
            .maybeSingle(),
          supabase
            .from('linkedin_sections')
            .select('analysis')
            .eq('candidate_id', candidateId)
            .eq('section_type', 'experience_1')
            .maybeSingle()
        ]);

        if (summaryResponse.error) {
          console.error("Error fetching business problems summary:", summaryResponse.error);
          toast({
            title: "Error Loading Data",
            description: "Failed to load business problems data. Please try again.",
            variant: "destructive",
          });
          throw summaryResponse.error;
        }
        
        if (summaryResponse.data) {
          console.log("Found existing business problems summary:", summaryResponse.data);
          setValue(summaryResponse.data.business_problems || "");
          setIsSubmitted(!!summaryResponse.data.business_problems);
        }

        setHasResume(!!resumeResponse.data?.business_problems);
        setHasLinkedIn(!!linkedInResponse.data?.analysis);
        setHasScreening(false);

        console.log("Business problems source availability:", {
          resume: !!resumeResponse.data?.business_problems,
          linkedin: !!linkedInResponse.data?.analysis,
          screening: false
        });

      } catch (error) {
        console.error("Error fetching initial business problems state:", error);
        toast({
          title: "Error",
          description: "Failed to load business problems section. Please refresh the page.",
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
      console.log("Submitting business problems to database for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          business_problems: value,
          business_problems_submitted: true // Added this flag
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("Business problems submitted successfully");
      setIsSubmitted(true);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Business problems saved successfully",
      });
    } catch (error) {
      console.error("Error submitting business problems:", error);
      toast({
        title: "Error",
        description: "Failed to save business problems",
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
      console.log("Resetting business problems in database for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          business_problems: "",
          resume_business_problems_source: null,
          linkedin_business_problems_source: null
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("Business problems reset successfully");
      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
      setMergeResult(null);
      toast({
        title: "Success",
        description: "Business problems have been reset",
      });
    } catch (error) {
      console.error("Error resetting business problems:", error);
      toast({
        title: "Error",
        description: "Failed to reset business problems",
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
      console.log("Starting merge operation for business problems, candidate:", candidateId);
      const { data, error } = await supabase.functions.invoke('merge-business-problems', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("Received merge response for business problems:", data);

      if (data?.data?.mergedStatements) {
        const result = data.data as MergeResult;
        setMergeResult(result);
        setValue(result.mergedStatements.join("\n\n"));
        setIsEditing(true);
        
        toast({
          title: "Success",
          description: "Business problems merged successfully",
        });
      } else {
        throw new Error("No merged statements received");
      }
    } catch (error) {
      console.error("Error merging business problems:", error);
      toast({
        title: "Merge Failed",
        description: "Failed to merge business problems. Please try again.",
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