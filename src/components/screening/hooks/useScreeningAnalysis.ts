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
        .single();

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
      console.log("Starting screening notes analysis for candidate:", candidateId);

      const { error } = await supabase.functions.invoke('analyze-screening-notes', {
        body: { candidateId, notes }
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['screeningAnalysis', candidateId] });
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
    }
  };

  return {
    analysis,
    isLoadingAnalysis,
    isAnalyzing,
    editingSection,
    setEditingSection,
    analyzeNotes,
    updateSection,
  };
};