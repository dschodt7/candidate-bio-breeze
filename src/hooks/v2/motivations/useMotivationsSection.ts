import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMotivationsSection = () => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  // Fetch existing data
  const { data: executiveSummary, isLoading } = useQuery({
    queryKey: ['executiveSummary', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("[useMotivationsSection] Fetching executive summary for:", candidateId);
      
      const { data, error } = await supabase
        .from('executive_summaries')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (error) {
        console.error("[useMotivationsSection] Error fetching summary:", error);
        throw error;
      }

      if (data?.motivations) {
        setValue(data.motivations);
        setIsSubmitted(true);
      }

      return data;
    },
    enabled: !!candidateId
  });

  const handleSubmit = async () => {
    if (!candidateId || !value.trim()) return;
    
    console.log("[useMotivationsSection] Submitting motivations");
    
    try {
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          motivations: value,
        });

      if (error) throw error;

      setIsSubmitted(true);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Motivations saved successfully",
      });
    } catch (error) {
      console.error("[useMotivationsSection] Error saving motivations:", error);
      toast({
        title: "Error",
        description: "Failed to save motivations",
        variant: "destructive",
      });
    }
  };

  const handleMerge = async () => {
    if (!candidateId) return;
    
    console.log("[useMotivationsSection] Starting merge operation");
    setIsMerging(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('merge-motivations', {
        body: { candidateId }
      });

      if (error) throw error;

      if (data?.mergedContent) {
        setValue(data.mergedContent);
        const { error: updateError } = await supabase
          .from('executive_summaries')
          .upsert({
            candidate_id: candidateId,
            motivations: data.mergedContent,
            resume_motivations_source: data.sourceBreakdown.resume,
            linkedin_motivations_source: data.sourceBreakdown.linkedin,
          });

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Motivations compiled successfully",
        });
      }
    } catch (error) {
      console.error("[useMotivationsSection] Merge operation failed:", error);
      toast({
        title: "Error",
        description: "Failed to compile motivations",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  const handleReset = async () => {
    if (!candidateId) return;
    
    console.log("[useMotivationsSection] Resetting motivations");
    
    try {
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          motivations: null,
          resume_motivations_source: null,
          linkedin_motivations_source: null,
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Motivations reset successfully",
      });
    } catch (error) {
      console.error("[useMotivationsSection] Reset operation failed:", error);
      toast({
        title: "Error",
        description: "Failed to reset motivations",
        variant: "destructive",
      });
    }
  };

  return {
    value,
    isSubmitted,
    isEditing,
    isLoading,
    isMerging,
    executiveSummary,
    setValue,
    setIsEditing,
    handleSubmit,
    handleMerge,
    handleReset,
  };
};