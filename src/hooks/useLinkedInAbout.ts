import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useLinkedInAbout = () => {
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
          .maybeSingle();

        if (error) throw error;
        setSavedContent(data?.content || null);
        console.log("LinkedIn About content fetched:", data?.content ? "Content found" : "No content");
      } catch (error) {
        console.error("Error fetching LinkedIn About content:", error);
        setSavedContent(null);
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

  return {
    savedContent,
    activeTab,
    setActiveTab,
    saveToDatabase,
    handleReset,
    candidateId // Added this to the return object
  };
};