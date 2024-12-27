import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const LinkedInAboutSection = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPasting, setIsPasting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aboutContent, setAboutContent] = useState("");

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter(item => item.type.startsWith('image'));
    
    if (imageItems.length === 0) {
      // If no image is found, allow normal text paste
      const text = e.clipboardData.getData('text');
      setAboutContent(text);
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

      console.log("Processing pasted About section screenshot for candidate:", candidateId);

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

      // Process the screenshot and extract text
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('analyze-linkedin-about', {
        body: { 
          candidateId,
          screenshot: base64Image
        }
      });

      if (error) throw error;

      if (data?.text) {
        setAboutContent(data.text);
        toast({
          title: "Success",
          description: "About section text extracted successfully",
        });
      }

    } catch (error) {
      console.error("Error processing About section screenshot:", error);
      toast({
        title: "Error",
        description: "Failed to process screenshot",
        variant: "destructive",
      });
    } finally {
      setIsPasting(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>About Section Details</Label>
      </div>
      <Textarea
        ref={textareaRef}
        value={aboutContent}
        onChange={(e) => setAboutContent(e.target.value)}
        placeholder="Paste your LinkedIn About section screenshot or text here"
        className="min-h-[200px] font-mono"
        onPaste={handlePaste}
        disabled={isPasting || isProcessing}
      />
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