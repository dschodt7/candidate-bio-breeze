import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface AnalyzeButtonProps {
  candidateId: string | null;
  linkedInSections: any[] | null;
  isLoading: boolean;
}

export const AnalyzeButton = ({
  candidateId,
  linkedInSections,
  isLoading
}: AnalyzeButtonProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!candidateId || !linkedInSections?.length) {
      toast({
        title: "Error",
        description: "No LinkedIn sections found to analyze",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log("Starting LinkedIn sections analysis");
      
      const { data, error } = await supabase.functions.invoke('analyze-linkedin-sections', {
        body: { 
          candidateId,
          sections: linkedInSections
        }
      });

      if (error) throw error;
      
      console.log("LinkedIn analysis completed:", data);
      
      // Invalidate the queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['linkedInAnalysis', candidateId] });
      
      toast({
        title: "Success",
        description: "LinkedIn sections analyzed successfully",
      });
    } catch (error) {
      console.error("Error analyzing LinkedIn sections:", error);
      toast({
        title: "Error",
        description: "Failed to analyze LinkedIn sections",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Remove the conditional rendering check
  return (
    <Button 
      onClick={handleAnalyze} 
      disabled={isLoading || isAnalyzing || !candidateId || !linkedInSections?.length}
      className="w-full mb-4"
    >
      {isAnalyzing ? "Analyzing..." : "Analyze LinkedIn Sections"}
    </Button>
  );
};