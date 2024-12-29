import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCredibilityDatabase = (candidateId: string | null) => {
  const { toast } = useToast();

  const submitToDatabase = async (value: string) => {
    if (!candidateId) return false;

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
        description: "Failed to save credibility statements. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetInDatabase = async () => {
    if (!candidateId) return false;

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

      console.log("Credibility reset successfully");
      toast({
        title: "Reset Complete",
        description: "Credibility statements have been reset",
      });
      return true;
    } catch (error) {
      console.error("Error resetting credibility:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset credibility statements. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    submitToDatabase,
    resetInDatabase,
  };
};