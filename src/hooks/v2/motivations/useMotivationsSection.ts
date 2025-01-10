import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useMotivationsSection = (candidateId: string | null) => {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMerging, setIsMerging] = useState(false);
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [hasLinkedIn, setHasLinkedIn] = useState(false);
  const [hasScreening, setHasScreening] = useState(false);

  // Query LinkedIn analysis
  const { data: linkedInAnalysis } = useQuery({
    queryKey: ['linkedInAnalysis', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("[useMotivationsSection] Fetching LinkedIn analysis for candidate:", candidateId);
      
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('analysis')
        .eq('candidate_id', candidateId)
        .eq('section_type', 'about')
        .maybeSingle();

      if (error) {
        console.error("[useMotivationsSection] Error fetching LinkedIn analysis:", error);
        return null;
      }

      console.log("[useMotivationsSection] LinkedIn analysis data:", data);
      return data?.analysis;
    },
    enabled: !!candidateId,
  });

  // Query Resume analysis
  const { data: resumeAnalysis } = useQuery({
    queryKey: ['resumeAnalysis', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      console.log("[useMotivationsSection] Fetching Resume analysis for candidate:", candidateId);
      
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('motivations')
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (error) {
        console.error("[useMotivationsSection] Error fetching Resume analysis:", error);
        return null;
      }

      console.log("[useMotivationsSection] Resume analysis data:", data);
      return data?.motivations;
    },
    enabled: !!candidateId,
  });

  useEffect(() => {
    const fetchInitialState = async () => {
      if (!candidateId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("[useMotivationsSection] Fetching initial state for candidate:", candidateId);
        setIsLoading(true);

        const { data, error } = await supabase
          .from('executive_summaries')
          .select('motivations, motivations_submitted')
          .eq('candidate_id', candidateId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          console.log("[useMotivationsSection] Received data:", data);
          setValue(data.motivations || "");
          setIsSubmitted(!!data.motivations_submitted);
          setExecutiveSummary(data);
        }
        
      } catch (error) {
        console.error("[useMotivationsSection] Error fetching initial state:", error);
        toast({
          title: "Error",
          description: "Failed to load motivations data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialState();
  }, [candidateId, toast]);

  // Update source indicators based on analyses
  useEffect(() => {
    setHasLinkedIn(!!linkedInAnalysis && Object.keys(linkedInAnalysis).length > 0);
    setHasResume(!!resumeAnalysis);
  }, [linkedInAnalysis, resumeAnalysis]);

  const handleSubmit = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[useMotivationsSection] Submitting motivations for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          motivations: value,
          motivations_submitted: true
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("[useMotivationsSection] Motivations submitted successfully");
      setIsSubmitted(true);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Motivations saved successfully",
      });
    } catch (error) {
      console.error("[useMotivationsSection] Error submitting motivations:", error);
      toast({
        title: "Error",
        description: "Failed to save motivations",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[useMotivationsSection] Resetting motivations for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .update({
          motivations: "",
          motivations_submitted: false,
          resume_motivations_source: null,
          linkedin_motivations_source: null
        })
        .eq('candidate_id', candidateId);

      if (error) throw error;

      console.log("[useMotivationsSection] Motivations reset successfully");
      setValue("");
      setIsSubmitted(false);
      setIsEditing(false);
      setHasResume(false);
      setHasLinkedIn(false);
      toast({
        title: "Success",
        description: "Motivations have been reset",
      });
    } catch (error) {
      console.error("[useMotivationsSection] Error resetting motivations:", error);
      toast({
        title: "Error",
        description: "Failed to reset motivations",
        variant: "destructive",
      });
    }
  };

  const handleMerge = async () => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    setIsMerging(true);
    try {
      console.log("[useMotivationsSection] Starting merge operation for candidate:", candidateId);
      const { data, error } = await supabase.functions.invoke('merge-motivations', {
        body: { candidateId }
      });

      if (error) throw error;

      console.log("[useMotivationsSection] Merge response:", data);

      if (data?.mergedContent) {
        setValue(data.mergedContent);
        setIsEditing(true);
        
        toast({
          title: "Success",
          description: "Motivations merged successfully",
        });
      } else {
        throw new Error("No merged content received");
      }
    } catch (error) {
      console.error("[useMotivationsSection] Merge operation failed:", error);
      toast({
        title: "Merge Failed",
        description: "Failed to merge motivations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  return {
    value,
    setValue,
    isSubmitted,
    isEditing,
    setIsEditing,
    isLoading,
    isMerging,
    executiveSummary,
    hasResume,
    hasLinkedIn,
    hasScreening,
    handleSubmit,
    handleReset,
    handleMerge,
  };
};
