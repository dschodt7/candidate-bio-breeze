import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LinkedInAnalysis } from "./types";

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
      
      // Type assertion with runtime check
      const linkedInAnalysis = data?.linked_in_analysis as Record<string, unknown>;
      if (!linkedInAnalysis) return null;

      // Validate the shape of the data
      const analysis: LinkedInAnalysis = {
        credibilityStatements: String(linkedInAnalysis.credibilityStatements || ''),
        caseStudies: String(linkedInAnalysis.caseStudies || ''),
        jobAssessment: String(linkedInAnalysis.jobAssessment || ''),
        motivations: String(linkedInAnalysis.motivations || ''),
        businessProblems: String(linkedInAnalysis.businessProblems || ''),
        interests: String(linkedInAnalysis.interests || ''),
        activitiesAndHobbies: String(linkedInAnalysis.activitiesAndHobbies || ''),
        foundationalUnderstanding: String(linkedInAnalysis.foundationalUnderstanding || ''),
      };

      return analysis;
    },
    enabled: !!searchParams.get('candidate'),
  });

  const handleSaveSection = async (key: keyof LinkedInAnalysis, content: string) => {
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
    handleSaveSection,
    setManualContent,
    setShowManualInput,
  };
};