import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExecutiveSummary } from "@/types/executive-summary";

export const useCredibilityState = (candidateId: string | null) => {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
          .select('credibility_statement, credibility_submitted')
          .eq('candidate_id', candidateId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          console.log("Fetched credibility state:", data);
          setValue(data.credibility_statement || "");
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

  return {
    value,
    setValue,
    isSubmitted,
    setIsSubmitted,
    isEditing,
    setIsEditing,
    isLoading
  };
};