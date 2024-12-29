import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

interface BrassTaxCriteria {
  credibility?: string;
  [key: string]: string | undefined;
}

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
          .select('brass_tax_criteria, credibility_submitted')
          .eq('candidate_id', candidateId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          console.log("Fetched credibility state:", data);
          const criteria = data.brass_tax_criteria as BrassTaxCriteria;
          setValue(criteria.credibility || "");
          setIsSubmitted(data.credibility_submitted || false);
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

      const { data, error } = await supabase.functions.invoke('merge-credibility-statements', {
        body: { candidateId }
      });

      if (error) throw error;

      if (data?.data) {
        console.log("Merge result:", data.data);
        setMergeResult(data.data);
        setValue(data.data.mergedStatements.join("\n\n"));
        return data.data;
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