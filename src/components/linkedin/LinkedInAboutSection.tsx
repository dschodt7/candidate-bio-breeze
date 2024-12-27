import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Check, RotateCw } from "lucide-react";

export const LinkedInAboutSection = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPasting, setIsPasting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aboutContent, setAboutContent] = useState("");
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter(item => item.type.startsWith('image'));
    
    if (imageItems.length > 0) {
      e.preventDefault();
      setIsPasting(true);
      
      try {
        // Convert clipboard image to base64
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
      } finally {
        setIsPasting(false);
      }
    } else {
      // If no image is found, allow normal text paste
      const text = e.clipboardData.getData('text');
      setAboutContent(text);
      setScreenshotData(null);
    }
  };

  const handleSubmit = async () => {
    const candidateId = searchParams.get('candidate');
    
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    if (!aboutContent && !screenshotData) {
      toast({
        title: "Error",
        description: "Please enter text or paste a screenshot",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (screenshotData) {
        console.log("Processing screenshot for candidate:", candidateId);
        const { data, error } = await supabase.functions.invoke('analyze-linkedin-about', {
          body: { 
            candidateId,
            screenshot: screenshotData
          }
        });

        if (error) throw error;

        if (data?.text) {
          setAboutContent(data.text);
          setScreenshotData(null);
        }
      }

      // Save the about content to the database
      const { error: updateError } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          linked_in_analysis: { about: aboutContent }
        }, {
          onConflict: 'candidate_id'
        });

      if (updateError) throw updateError;

      setIsSubmitted(true);
      toast({
        title: "Success",
        description: "About section saved successfully",
      });
    } catch (error) {
      console.error("Error processing About section:", error);
      toast({
        title: "Error",
        description: "Failed to process About section",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAboutContent("");
    setScreenshotData(null);
    setIsSubmitted(false);
    toast({
      title: "Reset",
      description: "About section has been reset",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>About Section Details</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSubmit}
            disabled={isProcessing || (!aboutContent && !screenshotData)}
            className="gap-2"
          >
            {isProcessing && <span className="animate-spin">⚡</span>}
            {isSubmitted && <Check className="h-4 w-4 text-green-500" />}
            {isSubmitted ? "Submitted" : "Submit"}
          </Button>
          {isSubmitted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        value={aboutContent}
        onChange={(e) => {
          setAboutContent(e.target.value);
          setIsSubmitted(false);
        }}
        placeholder="Paste your LinkedIn About section screenshot or text here"
        className="min-h-[200px] font-mono"
        onPaste={handlePaste}
        disabled={isProcessing}
      />
      {screenshotData && (
        <p className="text-sm text-blue-500">
          Screenshot ready for processing. Click submit to extract text.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Tip: You can either paste a screenshot of the About section or directly paste the text
      </p>
      {(isPasting || isProcessing) && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Processing content...
        </p>
      )}
    </div>
  );
};