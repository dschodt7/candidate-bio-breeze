import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useScreenshotProcessing = (
  candidateId: string | null,
  onSuccess: (text: string) => void
) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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

      console.log("Edge function response:", data);

      if (data?.text) {
        console.log("Text extracted successfully:", data.text.substring(0, 100) + "...");
        onSuccess(data.text);
      } else {
        console.error("No text found in response:", data);
        throw new Error("No text found in response");
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
    processScreenshot
  };
};