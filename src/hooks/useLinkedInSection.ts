import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";

export const useLinkedInSection = (sectionType: LinkedInSectionType) => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const candidateId = searchParams.get('candidate');
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "screenshot">("text");
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!candidateId) return;

      try {
        console.log(`Fetching LinkedIn ${sectionType} content for candidate:`, candidateId);
        const { data, error } = await supabase
          .from('linkedin_sections')
          .select('content')
          .eq('candidate_id', candidateId)
          .eq('section_type', sectionType)
          .maybeSingle();

        if (error) throw error;
        setSavedContent(data?.content || null);
        setHasContent(!!data?.content);
        console.log(`LinkedIn ${sectionType} content fetched:`, data?.content ? "Content found" : "No content");
      } catch (error) {
        console.error(`Error fetching LinkedIn ${sectionType} content:`, error);
        setSavedContent(null);
        setHasContent(false);
      }
    };

    fetchContent();
  }, [candidateId, sectionType]);

  const saveToDatabase = async (content: string) => {
    if (!candidateId) {
      toast({
        title: "Error",
        description: "No candidate selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`Saving ${sectionType} section for candidate:`, candidateId);
      const { error } = await supabase
        .from('linkedin_sections')
        .upsert({
          candidate_id: candidateId,
          section_type: sectionType,
          content: content
        }, {
          onConflict: 'candidate_id,section_type'
        });

      if (error) throw error;

      setSavedContent(content);
      setHasContent(true);
      console.log(`${sectionType} section saved successfully`);
      toast({
        title: "Success",
        description: `LinkedIn ${sectionType} section saved successfully`,
      });
    } catch (error) {
      console.error(`Error saving ${sectionType} section:`, error);
      toast({
        title: "Error",
        description: `Failed to save ${sectionType} section`,
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (!candidateId) return;

    try {
      console.log(`Resetting ${sectionType} section for candidate:`, candidateId);
      const { error } = await supabase
        .from('linkedin_sections')
        .delete()
        .eq('candidate_id', candidateId)
        .eq('section_type', sectionType);

      if (error) throw error;

      setSavedContent(null);
      setHasContent(false);
      setActiveTab("text");
      console.log(`${sectionType} section reset successfully`);
      toast({
        title: "Success",
        description: `LinkedIn ${sectionType} section has been reset`,
      });
    } catch (error) {
      console.error(`Error resetting ${sectionType} section:`, error);
      toast({
        title: "Error",
        description: `Failed to reset ${sectionType} section`,
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
    candidateId,
    hasContent
  };
};