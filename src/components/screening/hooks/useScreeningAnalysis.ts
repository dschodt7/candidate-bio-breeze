import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScreeningAnalysisData } from "../types/screening-analysis";

export const useScreeningAnalysis = (candidateId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fetch existing analysis
  const { data: analysis, isLoading: isLoadingAnalysis } = useQuery({
    queryKey: ['screeningAnalysis', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      
      console.log("Fetching screening analysis for candidate:", candidateId);
      const { data, error } = await supabase
        .from('screening_analyses')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!candidateId,
  });

  // Update analysis section
  const updateSection = async (sectionKey: keyof ScreeningAnalysisData, content: string) => {
    if (!candidateId || !analysis) {
      console.error("Cannot update section: missing candidateId or analysis");
      return;
    }

    try {
      console.log(`Updating screening analysis section ${sectionKey}:`, content);
      const { error } = await supabase
        .from('screening_analyses')
        .update({ [sectionKey]: content })
        .eq('id', analysis.id);

      if (error) throw error;

      setEditingSection(null);
      toast({
        title: "Success",
        description: "Analysis section updated successfully",
      });
    } catch (error) {
      console.error("Error updating analysis section:", error);
      toast({
        title: "Error",
        description: "Failed to update analysis section",
        variant: "destructive",
      });
    }
  };

  // Analyze notes
  const analyzeNotes = async (notes: string) => {
    if (!candidateId || !notes) {
      console.error("Cannot analyze notes: missing candidateId or notes");
      return;
    }

    try {
      setIsAnalyzing(true);
      setProgress(10);
      console.log("Starting screening notes analysis for candidate:", candidateId);

      setTimeout(() => setProgress(30), 1000);

      const { error } = await supabase.functions.invoke('analyze-screening-notes', {
        body: { candidateId, notes }
      });

      setProgress(70);

      if (error) throw error;

      setProgress(90);

      queryClient.invalidateQueries({ queryKey: ['screeningAnalysis', candidateId] });

      setProgress(100);

      toast({
        title: "Success",
        description: "Screening notes analyzed successfully",
      });
    } catch (error) {
      console.error("Error analyzing screening notes:", error);
      toast({
        title: "Error",
        description: "Failed to analyze screening notes",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return {
    analysis,
    isLoadingAnalysis,
    isAnalyzing,
    progress,
    editingSection,
    setEditingSection,
    analyzeNotes,
    updateSection,
  };
};