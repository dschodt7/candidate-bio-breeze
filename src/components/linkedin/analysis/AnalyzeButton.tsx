import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Wand2 } from "lucide-react";

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

  return (
    <Button 
      onClick={handleAnalyze} 
      disabled={isLoading || isAnalyzing || !candidateId || !linkedInSections?.length}
      className="w-full mb-4 relative group"
    >
      <span className="flex items-center justify-center gap-2">
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
            <span className="group-hover:scale-105 transition-transform">
              Analyze LinkedIn Sections
            </span>
          </>
        )}
      </span>
    </Button>
  );
};