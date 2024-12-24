import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const LinkedInScreenshotUpload = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPasting, setIsPasting] = useState(false);

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

      // Convert clipboard image to blob
      const imageBlob = await new Promise<Blob>((resolve) => {
        const item = imageItems[0];
        const blob = item.getAsFile();
        if (blob) resolve(blob);
      });

      // Generate a random filename
      const fileExt = imageBlob.type.split('/')[1];
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${candidateId}/${fileName}`;

      console.log("Uploading screenshot:", filePath);

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('linkedin-screenshots')
        .upload(filePath, imageBlob);

      if (uploadError) throw uploadError;

      toast({
        title: "Success",
        description: "Screenshot uploaded successfully",
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

  return (
    <div className="space-y-4">
      <Label>LinkedIn Screenshots</Label>
      <Textarea
        ref={textareaRef}
        placeholder="Paste your LinkedIn screenshots here (Ctrl/Cmd + V)"
        className="min-h-[200px] font-mono"
        onPaste={handlePaste}
        disabled={isPasting}
      />
      <p className="text-sm text-muted-foreground">
        Tip: Take screenshots of relevant LinkedIn sections and paste them directly here using Ctrl/Cmd + V
      </p>
    </div>
  );
};