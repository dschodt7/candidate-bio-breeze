import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, RotateCw } from "lucide-react";

interface LinkedInScreenshotUploadProps {
  candidateId: string | null;
  onSuccess: (text: string) => void;
}

export const LinkedInScreenshotUpload = ({ candidateId, onSuccess }: LinkedInScreenshotUploadProps) => {
  const { toast } = useToast();
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter(item => item.type.startsWith('image'));
    
    if (imageItems.length > 0) {
      e.preventDefault();
      
      try {
        const imageBlob = await new Promise<Blob>((resolve) => {
          const item = imageItems[0];
          const blob = item.getAsFile();
          if (blob) resolve(blob);
        });

        const base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageBlob);
        });

        setScreenshotData(base64Image);
        setIsSubmitted(false);
        toast({
          title: "Screenshot Ready",
          description: "Click submit to process the screenshot",
        });
      } catch (error) {
        console.error("Error handling screenshot:", error);
        toast({
          title: "Error",
          description: "Failed to process screenshot",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!candidateId || !screenshotData) {
      toast({
        title: "Error",
        description: !candidateId ? "No candidate selected" : "Please paste a screenshot first",
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

  const handleReset = () => {
    setScreenshotData(null);
    setIsSubmitted(false);
    toast({
      title: "Reset",
      description: "Screenshot has been cleared",
    });
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste your LinkedIn About section screenshot here"
        className="min-h-[200px] font-mono"
        onPaste={handlePaste}
        disabled={isProcessing}
      />
      {screenshotData && (
        <p className="text-sm text-blue-500">
          Screenshot ready for processing. Click submit to extract text.
        </p>
      )}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isProcessing || !screenshotData}
          className="gap-2"
        >
          {isProcessing && <span className="animate-spin">⚡</span>}
          {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
          {isSubmitted ? "Submitted" : "Submit"}
        </Button>
        {isSubmitted && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};