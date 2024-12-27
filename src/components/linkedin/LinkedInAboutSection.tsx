import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedInScreenshotUpload } from "./about/LinkedInScreenshotUpload";
import { LinkedInTextInput } from "./about/LinkedInTextInput";

interface LinkedInAboutSectionProps {
  onContentSaved: () => void;
  onContentReset: () => void;
}

export const LinkedInAboutSection = ({ 
  onContentSaved,
  onContentReset 
}: LinkedInAboutSectionProps) => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const candidateId = searchParams.get('candidate');
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "screenshot">("text");

  useEffect(() => {
    const fetchContent = async () => {
      if (!candidateId) return;

      try {
        console.log("Fetching LinkedIn About content for candidate:", candidateId);
        const { data, error } = await supabase
          .from('linkedin_sections')
          .select('content')
          .eq('candidate_id', candidateId)
          .eq('section_type', 'about')
          .single();

        if (error) throw error;
        setSavedContent(data?.content || null);
        console.log("LinkedIn About content fetched:", data?.content ? "Content found" : "No content");
      } catch (error) {
        console.error("Error fetching LinkedIn About content:", error);
      }
    };

    fetchContent();
  }, [candidateId]);

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
        .from('linkedin_sections')
        .upsert({
          candidate_id: candidateId,
          section_type: 'about',
          content: aboutContent
        }, {
          onConflict: 'candidate_id,section_type'
        });

      if (error) throw error;

      setSavedContent(aboutContent);
      onContentSaved();
      console.log("About section saved successfully");
      toast({
        title: "Success",
        description: "LinkedIn About section saved successfully",
      });
    } catch (error) {
      console.error("Error saving About section:", error);
      toast({
        title: "Error",
        description: "Failed to save About section",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (!candidateId) return;

    try {
      console.log("Resetting About section for candidate:", candidateId);
      const { error } = await supabase
        .from('linkedin_sections')
        .delete()
        .eq('candidate_id', candidateId)
        .eq('section_type', 'about');

      if (error) throw error;

      setSavedContent(null);
      onContentReset(); // Call the new prop to update parent state
      setActiveTab("text"); // Reset to default tab
      console.log("About section reset successfully");
      toast({
        title: "Success",
        description: "LinkedIn About section has been reset",
      });
    } catch (error) {
      console.error("Error resetting About section:", error);
      toast({
        title: "Error",
        description: "Failed to reset About section",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>About Section Details</Label>
      </div>
      
      <Tabs 
        defaultValue="text" 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "text" | "screenshot")}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="text" 
            disabled={savedContent && activeTab === "screenshot"}
          >
            Paste Text
          </TabsTrigger>
          <TabsTrigger 
            value="screenshot" 
            disabled={savedContent && activeTab === "text"}
          >
            Upload Screenshot
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text">
          <LinkedInTextInput 
            onSubmit={saveToDatabase}
            initialContent={savedContent}
            onContentSaved={() => {
              onContentSaved();
              setActiveTab("text");
            }}
            onReset={handleReset}
          />
        </TabsContent>
        
        <TabsContent value="screenshot">
          <LinkedInScreenshotUpload 
            candidateId={candidateId} 
            onSuccess={(text) => {
              setSavedContent(text);
              onContentSaved();
              setActiveTab("screenshot");
              toast({
                title: "Success",
                description: "Screenshot processed and text extracted successfully",
              });
            }}
          />
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        Tip: You can either paste a screenshot of the About section or directly paste the text
      </p>
    </div>
  );
};