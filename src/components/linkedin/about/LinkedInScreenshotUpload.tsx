import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ScreenshotPreview } from "./screenshot/ScreenshotPreview";
import { useScreenshotProcessing } from "./screenshot/useScreenshotProcessing";

interface LinkedInScreenshotUploadProps {
  candidateId: string | null;
  onSuccess: (text: string) => void;
}

export const LinkedInScreenshotUpload = ({ 
  candidateId, 
  onSuccess 
}: LinkedInScreenshotUploadProps) => {
  const { toast } = useToast();
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const { 
    isProcessing, 
    isSubmitted, 
    setIsSubmitted, 
    processScreenshot 
  } = useScreenshotProcessing(candidateId, onSuccess);

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

  const handleSubmit = () => {
    if (screenshotData) {
      processScreenshot(screenshotData);
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
      <ScreenshotPreview
        isProcessing={isProcessing}
        isSubmitted={isSubmitted}
        onSubmit={handleSubmit}
        onReset={handleReset}
        screenshotData={screenshotData}
      />
    </div>
  );
};