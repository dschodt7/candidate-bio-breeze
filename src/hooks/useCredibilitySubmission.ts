import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCredibilitySubmission = (candidateId: string | null) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (value: string) => {
    if (!candidateId || !value.trim()) return;

    try {
      console.log("Submitting credibility statements for candidate:", candidateId);
      
      const { error } = await supabase
        .from('executive_summaries')
        .update({ 
          brass_tax_criteria: { credibility: value },
          credibility_submitted: true 
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      setIsSubmitted(true);
      
      console.log("Credibility statements submitted successfully");
      toast({
        title: "Success",
        description: "Credibility statements saved and locked.",
      });
      return true;
    } catch (error) {
      console.error("Error saving credibility statements:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save credibility statements.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleReset = async () => {
    if (!candidateId) return;

    try {
      console.log("Resetting credibility statements for candidate:", candidateId);
      
      const { error } = await supabase
        .from('executive_summaries')
        .update({ 
          brass_tax_criteria: { credibility: "" },
          credibility_submitted: false 
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      setIsSubmitted(false);
      
      console.log("Credibility statements reset successfully");
      toast({
        title: "Reset",
        description: "Credibility statements have been reset.",
      });
      return true;
    } catch (error) {
      console.error("Error resetting credibility statements:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset credibility statements.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isSubmitted,
    setIsSubmitted,
    handleSubmit,
    handleReset,
  };
};