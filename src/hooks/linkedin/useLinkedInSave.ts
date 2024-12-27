import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";

export const useLinkedInSave = (
  candidateId: string | null, 
  sectionType: LinkedInSectionType,
  setSavedContent: (content: string | null) => void,
  setHasContent: (hasContent: boolean) => void
) => {
  const { toast } = useToast();

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

  return { saveToDatabase };
};