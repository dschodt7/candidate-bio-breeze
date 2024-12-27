import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useScreenshotProcessing = (
  candidateId: string | null,
  onSuccess: (text: string) => void
) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const processScreenshot = async (screenshotData: string) => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Processing screenshot for candidate:", candidateId);
      const { data, error } = await supabase.functions.invoke('analyze-linkedin-about', {
        body: { 
          candidateId,
          screenshot: screenshotData
        }
      });

      if (error) throw error;

      if (data?.text) {
        onSuccess(data.text);
        setIsSubmitted(true);
        toast({
          title: "Success",
          description: "Screenshot processed successfully",
        });
      }
    } catch (error) {
      console.error("Error processing screenshot:", error);
      toast({
        title: "Error",
        description: "Failed to process screenshot",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    isSubmitted,
    setIsSubmitted,
    processScreenshot
  };
};