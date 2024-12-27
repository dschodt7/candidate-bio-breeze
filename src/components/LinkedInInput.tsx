import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LinkedInUrlInput } from "./linkedin/LinkedInUrlInput";
import { CheckCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedInScreenshotUpload } from "./linkedin/LinkedInScreenshotUpload";
import { LinkedInTextInput } from "./linkedin/LinkedInTextInput";
import { useToast } from "@/hooks/use-toast";

export const LinkedInInput = () => {
  const [searchParams] = useSearchParams();
  const [hasAboutContent, setHasAboutContent] = useState(false);
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "screenshot">("text");
  const candidateId = searchParams.get('candidate');
  const { toast } = useToast();

  const fetchAboutContent = async () => {
    if (!candidateId) return;

    try {
      console.log("Fetching LinkedIn About section for candidate:", candidateId);
      const { data, error } = await supabase
        .from('linkedin_sections')
        .select('content')
        .eq('candidate_id', candidateId)
        .eq('section_type', 'about')
        .maybeSingle();

      if (error) throw error;
      
      setSavedContent(data?.content);
      setHasAboutContent(!!data?.content);
      console.log("LinkedIn About section fetch result:", !!data?.content);
    } catch (error) {
      console.error("Error fetching LinkedIn About section:", error);
      setHasAboutContent(false);
      setSavedContent(null);
    }
  };

  useEffect(() => {
    fetchAboutContent();
  }, [candidateId]);

  const handleSave = async (content: string) => {
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
          content: content
        }, {
          onConflict: 'candidate_id,section_type'
        });

      if (error) throw error;

      setSavedContent(content);
      setHasAboutContent(true);
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
      setHasAboutContent(false);
      setActiveTab("text");
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
    <Card className="p-6 animate-fadeIn">
      <LinkedInUrlInput />
      <Accordion type="single" collapsible className="mt-6">
        <AccordionItem value="about">
          <AccordionTrigger className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {hasAboutContent && <CheckCircle className="h-4 w-4 text-green-500" />}
              About Section
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">About Section Details</h4>
              </div>
              
              <Tabs 
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "text" | "screenshot")}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger 
                    value="text" 
                    disabled={!!savedContent}
                  >
                    Paste Text
                  </TabsTrigger>
                  <TabsTrigger 
                    value="screenshot" 
                    disabled={!!savedContent}
                  >
                    Upload Screenshot
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text">
                  <LinkedInTextInput 
                    onSubmit={handleSave}
                    initialContent={savedContent}
                    onReset={handleReset}
                  />
                </TabsContent>
                
                <TabsContent value="screenshot">
                  <LinkedInScreenshotUpload 
                    candidateId={candidateId} 
                    onSuccess={handleSave}
                    onReset={handleReset}
                  />
                </TabsContent>
              </Tabs>

              <p className="text-sm text-muted-foreground">
                Tip: You can either paste a screenshot of the About section or directly paste the text
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};