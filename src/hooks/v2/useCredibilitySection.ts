import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCredibilitySourceCheck } from "@/hooks/useCredibilitySourceCheck";
import { BrassTaxCriteria } from "@/types/executive-summary";

export const useCredibilitySection = (candidateId: string | null) => {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMerging, setIsMerging] = useState(false);

  const {
    hasResume,
    hasLinkedIn,
    hasScreening,
    isLoading: isSourceCheckLoading
  } = useCredibilitySourceCheck(candidateId);

  useEffect(() => {
    const fetchCredibilityState = async () => {
      if (!candidateId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching credibility state for candidate:", candidateId);
        const { data, error } = await supabase
          .from('executive_summaries')
          .select('brass_tax_criteria, credibility_submitted')
          .eq('candidate_id', candidateId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          console.log("Fetched credibility state:", data);
          const brassTaxData = data.brass_tax_criteria as BrassTaxCriteria;
          setValue(brassTaxData?.credibility || "");
          setIsSubmitted(data.credibility_submitted || false);
        }
      } catch (error) {
        console.error("Error fetching credibility state:", error);
        toast({
          title: "Error",
          description: "Failed to fetch credibility statements",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredibilityState();
  }, [candidateId, toast]);

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
      
      // Using upsert operation with candidate_id as the conflict target
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          brass_tax_criteria: { credibility: value },
          credibility_submitted: true
        }, {
          onConflict: 'candidate_id',
          ignoreDuplicates: false
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
        description: "Failed to save credibility statements. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (!candidateId) return;

    try {
      console.log("Resetting credibility for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          brass_tax_criteria: { credibility: "" },
          credibility_submitted: false
        }, {
          onConflict: 'candidate_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
      
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

  const handleMerge = async () => {
    if (!candidateId) return;
    
    setIsMerging(true);
    try {
      console.log("Starting merge operation for candidate:", candidateId);
      const { data, error } = await supabase.functions.invoke('merge-credibility-statements', {
        body: { candidateId }
      });

      if (error) throw error;

      if (data?.data?.mergedStatements) {
        setValue(data.data.mergedStatements.join("\n\n"));
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
    value,
    setValue,
    isSubmitted,
    isEditing,
    setIsEditing,
    isLoading: isLoading || isSourceCheckLoading,
    isMerging,
    hasResume,
    hasLinkedIn,
    hasScreening,
    handleSubmit,
    handleReset,
    handleMerge,
  };
};