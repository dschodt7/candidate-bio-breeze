import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMotivationsDatabase } from "./database/useMotivationsDatabase";
import { useMotivationsMerge } from "./merge/useMotivationsMerge";

export const useMotivationsSection = () => {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidate');
  
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Enhanced logging for data fetching
  const { data: executiveSummary, isLoading } = useQuery({
    queryKey: ['executiveSummary', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("[useMotivationsSection] Fetching executive summary for candidate:", candidateId);
      
      const { data, error } = await supabase
        .from('executive_summaries')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (error) {
        console.error("[useMotivationsSection] Error fetching summary:", error);
        throw error;
      }

      console.log("[useMotivationsSection] Fetched data:", {
        hasMotivations: !!data?.motivations,
        hasResumeSource: !!data?.resume_motivations_source,
        hasLinkedInSource: !!data?.linkedin_motivations_source
      });

      if (data?.motivations) {
        setValue(data.motivations);
        setIsSubmitted(true);
      }

      return data;
    },
    enabled: !!candidateId
  });

  const { submitToDatabase, resetInDatabase } = useMotivationsDatabase(candidateId);
  const { isMerging, handleMerge } = useMotivationsMerge(candidateId, setValue, setIsEditing);

  const handleSubmit = async () => {
    const success = await submitToDatabase(value);
    if (success) {
      setIsSubmitted(true);
      setIsEditing(false);
    }
  };

  const handleReset = async () => {
    const success = await resetInDatabase();
    if (success) {
      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
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