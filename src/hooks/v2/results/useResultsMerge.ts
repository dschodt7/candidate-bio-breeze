import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MergeResult } from "@/types/executive-summary";

export const useResultsMerge = (
  candidateId: string | null,
  setValue: (value: string) => void,
  setIsEditing: (value: boolean) => void,
  setIsMerging: (value: boolean) => void,
  setMergeResult: (value: MergeResult | null) => void
) => {
  const { toast } = useToast();

  const handleMerge = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    setIsMerging(true);
    try {
      console.log("Starting merge operation for results achievements, candidate:", candidateId);
      const { data, error } = await supabase.functions.invoke('merge-results-achievements', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("Received merge response for results:", data);

      if (data?.data?.mergedStatements) {
        const result = data.data as MergeResult;
        setMergeResult(result);
        setValue(result.mergedStatements.join("\n\n"));
        setIsEditing(true);
        
        toast({
          title: "Success",
          description: "Results and achievements merged successfully",
        });
      } else {
        throw new Error("No merged statements received");
      }
    } catch (error) {
      console.error("Error merging results achievements:", error);
      toast({
        title: "Merge Failed",
        description: "Failed to merge results and achievements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  return { handleMerge };
};