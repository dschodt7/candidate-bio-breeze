import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAnalysisState = (candidateId: string | null, analysis: any) => {
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const handleEdit = (key: string, content: string) => {
    setEditingSection(key);
    setEditedContent(content);
  };

  const handleSave = async (key: string) => {
    if (!candidateId || !analysis) return;

    try {
      const updatedAnalysis = {
        ...analysis,
        [key]: editedContent
      };

      const { error } = await supabase
        .from('executive_summaries')
        .update({ brass_tax_criteria: updatedAnalysis })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      setEditingSection(null);
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
    editingSection,
    editedContent,
    handleEdit,
    handleSave,
    setEditedContent
  };
};