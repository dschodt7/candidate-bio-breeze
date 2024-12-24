import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface LinkedInAnalysisData {
  credibilityStatements?: string;
  caseStudies?: string;
  jobAssessment?: string;
  motivations?: string;
  businessProblems?: string;
  interests?: string;
  activitiesAndHobbies?: string;
  foundationalUnderstanding?: string;
  [key: string]: string | undefined;
}

export const useLinkedInAnalysis = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualContent, setManualContent] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const { data: analysis, refetch } = useQuery({
    queryKey: ['linkedInAnalysis', searchParams.get('candidate')],
    queryFn: async () => {
      const candidateId = searchParams.get('candidate');
      if (!candidateId) return null;

      const { data, error } = await supabase
        .from('executive_summaries')
        .select('linked_in_analysis')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data?.linked_in_analysis || {}) as LinkedInAnalysisData;
    },
    enabled: !!searchParams.get('candidate'),
  });

  const handleAnalyze = async () => {
    const candidateId = searchParams.get('candidate');
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log("Starting LinkedIn analysis for candidate:", candidateId);

      const { data, error } = await supabase.functions.invoke('analyze-linkedin', {
        body: { 
          candidateId,
          linkedinContent: showManualInput ? manualContent : undefined
        }
      });

      if (error) throw error;

      await refetch();
      console.log("Analysis completed:", data);
      toast({
        title: "Success",
        description: "LinkedIn analysis completed successfully",
      });
      setShowManualInput(false);
      setManualContent("");
    } catch (error) {
      console.error("Error analyzing LinkedIn:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze LinkedIn profile",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveSection = async (key: string, content: string) => {
    const candidateId = searchParams.get('candidate');
    if (!candidateId || !analysis) return;

    try {
      const updatedAnalysis = {
        ...analysis,
        [key]: content
      };

      const { error } = await supabase
        .from('executive_summaries')
        .update({ linked_in_analysis: updatedAnalysis })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      await refetch();
      toast({
        title: "Success",
        description: "Analysis content updated successfully",
      });
    } catch (error) {
      console.error("Error updating analysis:", error);
      toast({
        title: "Error",
        description: "Failed to update analysis content",
        variant: "destructive",
      });
    }
  };

  return {
    analysis,
    isAnalyzing,
    manualContent,
    showManualInput,
    handleAnalyze,
    setManualContent,
    setShowManualInput,
    handleSaveSection,
  };
};