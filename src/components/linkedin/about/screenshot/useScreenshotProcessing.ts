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

      if (error) {
        // Check if this is a validation error from the edge function
        let errorMessage = error.message;
        try {
          const errorBody = JSON.parse(error.message);
          if (errorBody?.error) {
            errorMessage = errorBody.error;
          }
        } catch {
          // If parsing fails, use the original error message
        }
        
        console.error("Error processing screenshot:", error);
        toast({
          title: "Screenshot Processing Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      console.log("Edge function response:", data);

      if (data?.text) {
        console.log("Text extracted successfully:", data.text.substring(0, 100) + "...");
        onSuccess(data.text);
      } else {
        throw new Error("No text found in response");
      }
    } catch (error) {
      console.error("Error processing screenshot:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process screenshot",
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