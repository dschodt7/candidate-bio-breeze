import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCredibilityDatabase = (candidateId: string | null) => {
  const { toast } = useToast();

  const showToast = (title: string, description: string, type: "success" | "error" = "success") => {
    toast({
      title,
      description,
      variant: type === "error" ? "destructive" : "default",
    });
  };

  const submitToDatabase = async (value: string) => {
    if (!candidateId) {
      showToast("Error", "No candidate selected", "error");
      return false;
    }

    try {
      console.log("Submitting credibility statement to database for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          credibility_statement: value,
          credibility_submitted: true
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("Credibility statement submitted successfully");
      showToast("Success", "Credibility statement saved successfully");
      return true;
    } catch (error) {
      console.error("Error submitting credibility statement:", error);
      showToast("Error", "Failed to save credibility statement", "error");
      return false;
    }
  };

  const resetInDatabase = async () => {
    if (!candidateId) {
      showToast("Error", "No candidate selected", "error");
      return false;
    }

    try {
      console.log("Resetting credibility statement in database for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          credibility_statement: "",
          credibility_submitted: false
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("Credibility statement reset successfully");
      showToast("Success", "Credibility statement has been reset");
      return true;
    } catch (error) {
      console.error("Error resetting credibility statement:", error);
      showToast("Error", "Failed to reset credibility statement", "error");
      return false;
    }
  };

  return {
    submitToDatabase,
    resetInDatabase,
  };
};