import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Wand2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  const [progress, setProgress] = useState(0);

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
      setProgress(10);
      console.log("Starting LinkedIn sections analysis");
      
      setTimeout(() => setProgress(30), 1000);
      
      const { data, error } = await supabase.functions.invoke('analyze-linkedin-sections', {
        body: { 
          candidateId,
          sections: linkedInSections
        }
      });

      setProgress(70);
      
      if (error) throw error;
      
      console.log("LinkedIn analysis completed:", data);
      
      setProgress(90);
      
      // Invalidate the queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['linkedInAnalysis', candidateId] });
      
      setProgress(100);
      
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
      setProgress(0);
    }
  };

  return (
    <div className="w-full space-y-2">
      <Button 
        onClick={handleAnalyze} 
        disabled={isLoading || isAnalyzing || !candidateId || !linkedInSections?.length}
        className="w-full relative group"
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
      {isAnalyzing && (
        <Progress 
          value={progress} 
          className="h-2 w-full bg-gray-100"
          indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-in-out"
        />
      )}
    </div>
  );
};