import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedInScreenshotUpload } from "./about/LinkedInScreenshotUpload";
import { LinkedInTextInput } from "./about/LinkedInTextInput";

export const LinkedInAboutSection = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const candidateId = searchParams.get('candidate');

  const saveToDatabase = async (aboutContent: string) => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Saving About section for candidate:", candidateId);
      const { error } = await supabase
        .from('executive_summaries')
        .upsert({
          candidate_id: candidateId,
          linked_in_analysis: { about: aboutContent }
        }, {
          onConflict: 'candidate_id'
        });

      if (error) throw error;

      console.log("About section saved successfully");
    } catch (error) {
      console.error("Error saving About section:", error);
      toast({
        title: "Error",
        description: "Failed to save About section",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>About Section Details</Label>
      </div>
      
      <Tabs defaultValue="text" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Paste Text</TabsTrigger>
          <TabsTrigger value="screenshot">Upload Screenshot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text">
          <LinkedInTextInput onSubmit={saveToDatabase} />
        </TabsContent>
        
        <TabsContent value="screenshot">
          <LinkedInScreenshotUpload 
            candidateId={candidateId} 
            onSuccess={saveToDatabase}
          />
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        Tip: You can either paste a screenshot of the About section or directly paste the text
      </p>
    </div>
  );
};