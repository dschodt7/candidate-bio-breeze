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
  } = useScreenshotProcessing(candidateId, (text) => {
    console.log("Screenshot processing success callback with text:", text);
    onSuccess(text);
    toast({
      title: "Success",
      description: "Screenshot processed and text extracted successfully",
    });
  });

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter(item => item.type.startsWith('image'));
    
    if (imageItems.length > 0) {
      e.preventDefault();
      console.log("Image found in clipboard, processing...");
      
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

        console.log("Screenshot converted to base64, ready for processing");
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
      console.log("Submitting screenshot for processing");
      processScreenshot(screenshotData);
    }
  };

  const handleReset = () => {
    setScreenshotData(null);
    setIsSubmitted(false);
    console.log("Screenshot upload reset");
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