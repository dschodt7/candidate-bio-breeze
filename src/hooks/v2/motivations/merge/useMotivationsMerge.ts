import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useMotivationsMerge = (
  candidateId: string | null,
  setValue: (value: string) => void,
  setIsEditing: (value: boolean) => void
) => {
  const [isMerging, setIsMerging] = useState(false);
  const { toast } = useToast();

  const handleMerge = async () => {
    if (!candidateId) {
      console.log("[useMotivationsMerge] Merge blocked - missing candidateId");
      return;
    }
    
    console.log("[useMotivationsMerge] Starting merge operation");
    setIsMerging(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('merge-motivations', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("[useMotivationsMerge] Merge response:", {
        hasContent: !!data?.mergedContent,
        sourceBreakdown: data?.sourceBreakdown
      });

      if (data?.mergedContent) {
        setValue(data.mergedContent);
        setIsEditing(true);
        
        const { error: updateError } = await supabase
          .from('executive_summaries')
          .upsert({
            candidate_id: candidateId,
            motivations: data.mergedContent,
            resume_motivations_source: data.sourceBreakdown.resume,
            linkedin_motivations_source: data.sourceBreakdown.linkedin,
          }, {
            onConflict: 'candidate_id'
          });

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Motivations compiled successfully",
        });
      }
    } catch (error) {
      console.error("[useMotivationsMerge] Merge operation failed:", error);
      toast({
        title: "Error",
        description: "Failed to compile motivations",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  return {
    isMerging,
    handleMerge
  };
};