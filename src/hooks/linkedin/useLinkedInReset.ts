import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LinkedInSectionType } from "@/integrations/supabase/types/linkedin";

export const useLinkedInReset = (
  candidateId: string | null,
  sectionType: LinkedInSectionType,
  setSavedContent: (content: string | null) => void,
  setHasContent: (hasContent: boolean) => void,
  setActiveTab: (tab: "text" | "screenshot") => void
) => {
  const { toast } = useToast();

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

  return { handleReset };
};