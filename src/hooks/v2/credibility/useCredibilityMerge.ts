import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

export const useCredibilityMerge = (
  candidateId: string | null,
  setValue: (value: string) => void,
  setIsEditing: (value: boolean) => void
) => {
  const { toast } = useToast();
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);

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
        const result = data.data as MergeResult;
        setMergeResult(result);
        setValue(result.mergedStatements.join("\n\n"));
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
    isMerging,
    mergeResult,
    handleMerge
  };
};