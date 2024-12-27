import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, RotateCw } from "lucide-react";
import { useScreenshotProcessing } from "@/hooks/useScreenshotProcessing";

interface LinkedInScreenshotUploadProps {
  candidateId: string | null;
  onSuccess: (text: string) => void;
  onReset: () => void;
}

export const LinkedInScreenshotUpload = ({ 
  candidateId, 
  onSuccess,
  onReset
}: LinkedInScreenshotUploadProps) => {
  const { toast } = useToast();
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isTextExtracted, setIsTextExtracted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    isProcessing,
    processScreenshot 
  } = useScreenshotProcessing(candidateId, (text) => {
    console.log("Screenshot processing success callback with text:", text);
    setExtractedText(text);
    setIsTextExtracted(true);
    toast({
      title: "Success",
      description: "Text extracted successfully. Please review and submit.",
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
        toast({
          title: "Screenshot Ready",
          description: "Click process to extract text from the screenshot",
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

  const handleProcess = () => {
    if (screenshotData) {
      console.log("Processing screenshot for text extraction");
      setIsTextExtracted(false);
      processScreenshot(screenshotData);
    }
  };

  const handleSubmit = () => {
    if (extractedText.trim()) {
      console.log("Submitting extracted text");
      onSuccess(extractedText);
      setIsSubmitted(true);
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    console.log("Resetting screenshot upload state");
    setScreenshotData(null);
    setExtractedText("");
    setIsTextExtracted(false);
    setIsSubmitted(false);
    setIsEditing(false);
    onReset();
  };

  if (isTextExtracted) {
    return (
      <div className="space-y-4">
        <Textarea
          value={extractedText}
          onChange={(e) => {
            setExtractedText(e.target.value);
            if (!isEditing) setIsEditing(true);
          }}
          className="min-h-[200px] font-mono"
          placeholder="Review the extracted text"
          disabled={isSubmitted && !isEditing}
        />
        <div className="flex gap-2">
          {!isSubmitted || isEditing ? (
            <Button
              onClick={handleSubmit}
              disabled={!extractedText.trim()}
              className="gap-2"
            >
              {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
              Submit
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste your LinkedIn About section screenshot here"
        className="min-h-[200px] font-mono"
        onPaste={handlePaste}
        disabled={isProcessing}
      />
      {screenshotData && (
        <div className="space-y-4">
          <p className="text-sm text-blue-500">
            Screenshot ready for processing. Click process to extract text.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleProcess}
              disabled={isProcessing || !screenshotData}
              className="gap-2"
            >
              {isProcessing && <span className="animate-spin">⚡</span>}
              Process Screenshot
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};