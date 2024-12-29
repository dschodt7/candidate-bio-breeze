import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useBrassTaxSection = (candidateId: string | null, sectionKey: string) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!candidateId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log(`Checking submission status for ${sectionKey}`);
        const { data, error } = await supabase
          .from('executive_summaries')
          .select('brass_tax_criteria')
          .eq('candidate_id', candidateId)
          .maybeSingle();

        if (error) throw error;

        const isSubmittedValue = data?.brass_tax_criteria?.[sectionKey]?.submitted || false;
        setIsSubmitted(isSubmittedValue);
        console.log(`${sectionKey} submission status:`, isSubmittedValue);
      } catch (error) {
        console.error(`Error checking ${sectionKey} submission status:`, error);
        toast({
          title: "Error",
          description: "Failed to check submission status",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSubmissionStatus();
  }, [candidateId, sectionKey, toast]);

  const handleSubmit = async (value: string) => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log(`Submitting ${sectionKey} for candidate:`, candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          brass_tax_criteria: {
            [sectionKey]: {
              value,
              submitted: true,
              updatedAt: new Date().toISOString()
            }
          }
        }, {
          onConflict: 'candidate_id'
        });

      if (error) throw error;

      setIsSubmitted(true);
      console.log(`${sectionKey} submitted successfully`);
      toast({
        title: "Success",
        description: `${sectionKey} saved successfully`,
      });
      return true;
    } catch (error) {
      console.error(`Error submitting ${sectionKey}:`, error);
      toast({
        title: "Error",
        description: `Failed to save ${sectionKey}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const handleReset = async () => {
    if (!candidateId) return;

    try {
      console.log(`Resetting ${sectionKey} for candidate:`, candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          brass_tax_criteria: {
            [sectionKey]: {
              value: "",
              submitted: false,
              updatedAt: new Date().toISOString()
            }
          }
        }, {
          onConflict: 'candidate_id'
        });

      if (error) throw error;

      setIsSubmitted(false);
      console.log(`${sectionKey} reset successfully`);
      toast({
        title: "Reset",
        description: `${sectionKey} has been reset`,
      });
    } catch (error) {
      console.error(`Error resetting ${sectionKey}:`, error);
      toast({
        title: "Error",
        description: `Failed to reset ${sectionKey}`,
        variant: "destructive",
      });
    }
  };

  return {
    isSubmitted,
    isLoading,
    handleSubmit,
    handleReset
  };
};