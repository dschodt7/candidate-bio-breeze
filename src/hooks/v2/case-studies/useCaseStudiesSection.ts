import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

export const useCaseStudiesSection = (candidateId: string | null) => {
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
        console.log("Fetching initial case studies state for candidate:", candidateId);
        setIsLoading(true);

        const [summaryResponse, resumeResponse, linkedInResponse] = await Promise.all([
          supabase
            .from('executive_summaries')
            .select('case_studies')
            .eq('candidate_id', candidateId)
            .maybeSingle(),
          supabase
            .from('resume_analyses')
            .select('case_studies')
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
          console.error("Error fetching case studies summary:", summaryResponse.error);
          toast({
            title: "Error Loading Data",
            description: "Failed to load case studies data. Please try again.",
            variant: "destructive",
          });
          throw summaryResponse.error;
        }
        
        if (summaryResponse.data) {
          console.log("Found existing case studies summary:", summaryResponse.data);
          setValue(summaryResponse.data.case_studies || "");
          setIsSubmitted(!!summaryResponse.data.case_studies);
        }

        setHasResume(!!resumeResponse.data?.case_studies);
        setHasLinkedIn(!!linkedInResponse.data?.analysis);
        setHasScreening(false);

        console.log("Case studies source availability:", {
          resume: !!resumeResponse.data?.case_studies,
          linkedin: !!linkedInResponse.data?.analysis,
          screening: false
        });

      } catch (error) {
        console.error("Error fetching initial case studies state:", error);
        toast({
          title: "Error",
          description: "Failed to load case studies section. Please refresh the page.",
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
      console.log("[CaseStudiesSection] Submitting case studies to database for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          case_studies: value,
          case_studies_submitted: true  // Added this flag
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("[CaseStudiesSection] Case studies submitted successfully");
      setIsSubmitted(true);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Case studies saved successfully",
      });
    } catch (error) {
      console.error("[CaseStudiesSection] Error submitting case studies:", error);
      toast({
        title: "Error",
        description: "Failed to save case studies",
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
      console.log("Resetting case studies in database for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          case_studies: "",
          resume_case_source: null,
          linkedin_case_source: null
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("Case studies reset successfully");
      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
      setMergeResult(null);
      toast({
        title: "Success",
        description: "Case studies have been reset",
      });
    } catch (error) {
      console.error("Error resetting case studies:", error);
      toast({
        title: "Error",
        description: "Failed to reset case studies",
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
      console.log("Starting merge operation for case studies, candidate:", candidateId);
      const { data, error } = await supabase.functions.invoke('merge-case-studies', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("Received merge response for case studies:", data);

      if (data?.data?.mergedStatements) {
        const result = data.data as MergeResult;
        setMergeResult(result);
        setValue(result.mergedStatements.join("\n\n"));
        setIsEditing(true);
        
        toast({
          title: "Success",
          description: "Case studies merged successfully",
        });
      } else {
        throw new Error("No merged statements received");
      }
    } catch (error) {
      console.error("Error merging case studies:", error);
      toast({
        title: "Merge Failed",
        description: "Failed to merge case studies. Please try again.",
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
