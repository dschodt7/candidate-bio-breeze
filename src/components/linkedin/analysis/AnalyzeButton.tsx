import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  const handleAnalyze = async () => {
    if (!candidateId || !linkedInSections?.length) return;

    try {
      console.log("Starting LinkedIn sections analysis");
      const { data, error } = await supabase.functions.invoke('analyze-linkedin-sections', {
        body: { 
          candidateId,
          sections: linkedInSections
        }
      });

      if (error) throw error;
      console.log("LinkedIn analysis completed:", data);
    } catch (error) {
      console.error("Error analyzing LinkedIn sections:", error);
    }
  };

  const hasSections = linkedInSections && linkedInSections.length > 0;

  if (!hasSections) return null;

  return (
    <Button 
      onClick={handleAnalyze} 
      disabled={isLoading}
      className="w-full mb-4"
    >
      Analyze LinkedIn Sections
    </Button>
  );
};