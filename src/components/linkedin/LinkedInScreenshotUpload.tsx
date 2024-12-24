import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const LinkedInScreenshotUpload = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPasting, setIsPasting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter(item => item.type.startsWith('image'));
    
    if (imageItems.length === 0) {
      toast({
        title: "No image found",
        description: "Please paste a screenshot from your clipboard",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPasting(true);
      const candidateId = searchParams.get('candidate');
      
      if (!candidateId) {
        toast({
          title: "Error",
          description: "No candidate selected",
          variant: "destructive",
        });
        return;
      }

      console.log("Processing pasted screenshot for candidate:", candidateId);

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

      setScreenshots(prev => [...prev, base64Image]);
      
      toast({
        title: "Success",
        description: "Screenshot added successfully",
      });

      // Clear the textarea after successful upload
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }

    } catch (error) {
      console.error("Error processing screenshot:", error);
      toast({
        title: "Error",
        description: "Failed to process screenshot",
        variant: "destructive",
      });
    } finally {
      setIsPasting(false);
    }
  };

  const handleAnalyze = async () => {
    if (screenshots.length === 0) {
      toast({
        title: "No screenshots",
        description: "Please paste at least one LinkedIn screenshot before analyzing",
        variant: "destructive",
      });
      return;
    }

    const candidateId = searchParams.get('candidate');
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log("Analyzing LinkedIn screenshots for candidate:", candidateId);

      const { data, error } = await supabase.functions.invoke('analyze-linkedin-screenshots', {
        body: { 
          candidateId,
          screenshots
        }
      });

      if (error) throw error;

      console.log("Analysis completed successfully:", data);
      toast({
        title: "Success",
        description: "LinkedIn analysis completed successfully",
      });

      // Clear screenshots after successful analysis
      setScreenshots([]);
      
    } catch (error) {
      console.error("Error analyzing LinkedIn screenshots:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze LinkedIn screenshots",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>LinkedIn Screenshots</Label>
        <Button 
          onClick={handleAnalyze}
          disabled={isAnalyzing || screenshots.length === 0}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Screenshots"}
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        placeholder="Paste your LinkedIn screenshots here (Ctrl/Cmd + V)"
        className="min-h-[200px] font-mono"
        onPaste={handlePaste}
        disabled={isPasting}
      />
      {screenshots.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''} ready for analysis
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Tip: Take screenshots of relevant LinkedIn sections and paste them directly here using Ctrl/Cmd + V
      </p>
    </div>
  );
};