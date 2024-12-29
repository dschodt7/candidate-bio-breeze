import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

export const useCredibilityMerge = (candidateId: string | null) => {
  const { toast } = useToast();
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  const handleMergeCredibility = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsMerging(true);
      setMergeResult(null);
      console.log("Starting credibility merge for candidate:", candidateId);

      const { data, error } = await supabase.functions.invoke('merge-credibility-statements', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("Credibility merge completed:", data);
      if (data?.data) {
        console.log("Merge result:", data.data);
        return data.data;
      }
      
      toast({
        title: "Success",
        description: "Credibility statements have been merged successfully.",
      });
      return null;
    } catch (error) {
      console.error("Error merging credibility statements:", error);
      toast({
        title: "Merge Failed",
        description: "There was an error merging the credibility statements.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsMerging(false);
    }
  };

  return {
    mergeResult,
    setMergeResult,
    isMerging,
    setIsMerging,
    handleMergeCredibility,
  };
};