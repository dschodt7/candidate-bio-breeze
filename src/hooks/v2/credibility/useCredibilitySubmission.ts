import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCredibilitySubmission = (
  candidateId: string | null,
  setIsSubmitted: (value: boolean) => void,
  setIsEditing: (value: boolean) => void,
  setValue: (value: string) => void
) => {
  const { toast } = useToast();

  const handleSubmit = async (value: string) => {
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

  const handleReset = async () => {
    if (!candidateId) return;

    try {
      console.log("Resetting credibility for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          credibility_statement: null,
          credibility_submitted: false,
          resume_credibility_source: null,
          linkedin_credibility_source: null
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

  return {
    handleSubmit,
    handleReset
  };
};