import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useMotivationsDatabase = (candidateId: string | null) => {
  const { toast } = useToast();

  const submitToDatabase = async (value: string) => {
    if (!candidateId) {
      console.error("[useMotivationsDatabase] Submit blocked - missing candidateId");
      return false;
    }

    console.log("[useMotivationsDatabase] Submitting motivations");
    
    try {
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          motivations: value,
        }, {
          onConflict: 'candidate_id'
        });

      if (error) throw error;

      console.log("[useMotivationsDatabase] Motivations submitted successfully");
      toast({
        title: "Success",
        description: "Motivations saved successfully",
      });
      return true;
    } catch (error) {
      console.error("[useMotivationsDatabase] Error saving motivations:", error);
      toast({
        title: "Error",
        description: "Failed to save motivations",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetInDatabase = async () => {
    if (!candidateId) {
      console.error("[useMotivationsDatabase] Reset blocked - missing candidateId");
      return false;
    }
    
    console.log("[useMotivationsDatabase] Resetting motivations");
    
    try {
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          motivations: null,
          resume_motivations_source: null,
          linkedin_motivations_source: null,
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("[useMotivationsDatabase] Motivations reset successful");
      toast({
        title: "Success",
        description: "Motivations reset successfully",
      });
      return true;
    } catch (error) {
      console.error("[useMotivationsDatabase] Reset operation failed:", error);
      toast({
        title: "Error",
        description: "Failed to reset motivations",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    submitToDatabase,
    resetInDatabase
  };
};