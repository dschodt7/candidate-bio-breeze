import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

export const useCredibilitySection = (candidateId: string | null) => {
  const { toast } = useToast();
  
  // Core state
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

  // Fetch initial state and check sources
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

  // Handle submit
  const handleSubmit = async () => {
    if (!candidateId || !value.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Submitting credibility with value:", value);
      
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          credibility_statement: value,
          credibility_submitted: true
        });

      if (error) throw error;

      setIsSubmitted(true);
      setIsEditing(false);
      
      console.log("Credibility submitted successfully");
      toast({
        title: "Success",
        description: "Credibility statements saved",
      });
    } catch (error) {
      console.error("Error submitting credibility:", error);
      toast({
        title: "Error",
        description: "Failed to save credibility statements",
        variant: "destructive",
      });
    }
  };

  // Handle reset
  const handleReset = async () => {
    if (!candidateId) return;

    try {
      console.log("Resetting credibility for candidate:", candidateId);
      
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          credibility_statement: null,
          credibility_submitted: false,
          resume_credibility_source: null,
          linkedin_credibility_source: null
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
      setMergeResult(null);
      
      console.log("Credibility reset successfully");
      toast({
        title: "Reset",
        description: "Credibility statements have been reset",
      });
    } catch (error) {
      console.error("Error resetting credibility:", error);
      toast({
        title: "Error",
        description: "Failed to reset credibility statements",
        variant: "destructive",
      });
    }
  };

  // Handle merge
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
      console.log("Starting merge operation for candidate:", candidateId);
      const { data: { data }, error } = await supabase.functions.invoke('merge-credibility-statements', {
        body: { candidateId }
      });

      if (error) throw error;

      if (data?.mergedStatements) {
        const result = data as MergeResult;
        setMergeResult(result);
        setValue(result.mergedStatements.join("\n\n"));
        setIsEditing(true);
        
        toast({
          title: "Success",
          description: "Credibility statements merged successfully",
        });
      }
    } catch (error) {
      console.error("Error merging credibility statements:", error);
      toast({
        title: "Error",
        description: "Failed to merge credibility statements",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  return {
    // State
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
    
    // Operations
    handleSubmit,
    handleReset,
    handleMerge,
  };
};