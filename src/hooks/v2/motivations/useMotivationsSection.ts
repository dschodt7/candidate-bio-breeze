import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
          .select('motivations, resume_motivations_source, linkedin_motivations_source')
          .eq('candidate_id', candidateId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          console.log("[useMotivationsSection] Received data:", data);
          setValue(data.motivations || "");
          setIsSubmitted(!!data.motivations);
          setHasResume(!!data.resume_motivations_source);
          setHasLinkedIn(!!data.linkedin_motivations_source);
          setHasScreening(false); // Motivations don't have screening source
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