import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult, BrassTaxCriteria, ExecutiveSummary } from "@/types/executive-summary";
import { useState, useEffect } from "react";

export const useCredibilityState = (candidateId: string | null) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
          .select('*')
          .eq('candidate_id', candidateId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const summary = data as ExecutiveSummary;
          console.log("Fetched credibility state:", summary);
          setValue(summary.brass_tax_criteria?.credibility || "");
          setIsSubmitted(summary.credibility_submitted || false);
        }
      } catch (error) {
        console.error("Error fetching credibility state:", error);
        toast({
          title: "Error",
          description: "Failed to fetch credibility state",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredibilityState();
  }, [candidateId, toast]);

  const handleMerge = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsMerging(true);
      setMergeResult(null);
      console.log("Starting credibility merge for candidate:", candidateId);

      const { data: { data }, error } = await supabase.functions.invoke('merge-credibility-statements', {
        body: { candidateId }
      });

      if (error) throw error;

      if (data) {
        console.log("Merge result:", data);
        setMergeResult(data);
        setValue(data.mergedStatements.join("\n\n"));
        return data;
      }
      
      toast({
        title: "Success",
        description: "Credibility statements have been merged",
      });
      return null;
    } catch (error) {
      console.error("Error merging credibility statements:", error);
      toast({
        title: "Merge Failed",
        description: "There was an error merging the credibility statements",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsMerging(false);
    }
  };

  const handleSubmit = async (newValue: string) => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log("Submitting credibility with value:", newValue);
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          brass_tax_criteria: { credibility: newValue },
          credibility_submitted: true
        });

      if (error) throw error;

      setValue(newValue);
      setIsSubmitted(true);
      
      console.log("Credibility submitted successfully");
      toast({
        title: "Success",
        description: "Credibility statements saved",
      });
      return true;
    } catch (error) {
      console.error("Error submitting credibility:", error);
      toast({
        title: "Error",
        description: "Failed to save credibility statements",
        variant: "destructive",
      });
      return false;
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
        });

      if (error) throw error;

      setValue("");
      setIsSubmitted(false);
      setMergeResult(null);
      
      console.log("Credibility reset successfully");
      toast({
        title: "Reset",
        description: "Credibility statements have been reset",
      });
      return true;
    } catch (error) {
      console.error("Error resetting credibility:", error);
      toast({
        title: "Error",
        description: "Failed to reset credibility statements",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isSubmitted,
    mergeResult,
    isMerging,
    value,
    setValue,
    handleSubmit,
    handleReset,
    handleMerge,
    isLoading
  };
};